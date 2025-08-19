import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { RefreshToken } from '../models/RefreshToken';
import { config } from '../config/environment';
import { AuthRequest, IUser } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, autoId, password } = req.body;

    let user;
    
    // Support both email and autoId login
    if (email) {
      // Factory admin login with email
      user = await User.findOne({ email: email.toLowerCase(), isActive: true }).populate('tenantId');
    } else if (autoId) {
      // Employee/Supervisor login with autoId
      user = await User.findOne({ autoId, isActive: true }).populate('tenantId');
    } else {
      res.status(400).json({
        success: false,
        message: 'Email or Auto ID is required',
      });
      return;
    }
    
    if (!user || !(await (user as IUser).comparePassword(password))) {
      res.status(401).json({
        success: false,
        message: email ? 'Invalid email or password' : 'Invalid Auto ID or password',
      });
      return;
    }

    // Check if tenant is active (except for super admin)
    if (user.role !== 'super_admin' && user.tenantId) {
      const tenant = await Tenant.findById(user.tenantId);
      if (!tenant || tenant.status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Factory account is not active',
        });
        return;
      }
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId },
      config.jwt.secret as Secret,
      { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] }
    );

    const refreshTokenValue = jwt.sign(
      { userId: user._id },
      config.jwt.refreshSecret as Secret,
      { expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'] }
    );

    // Save refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Get tenant data for response
    const tenant = user.tenantId ? await Tenant.findById(user.tenantId) : null;

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        tenant: tenant?.toJSON() || null,
        token: accessToken,
        refreshToken: refreshTokenValue,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    
    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token: refreshToken,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId },
      config.jwt.secret as Secret,
      { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] }
    );

    res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: refreshToken, // Keep the same refresh token
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

interface SignupRequest {
  factoryName: string;
  address: string;
  workersCount: number;
  ownerEmail: string;
  phone: string;
  loginEmail: string;
  password: string;
}

export const signup = async (req: Request<object, object, SignupRequest>, res: Response): Promise<void> => {
  try {


    const {
      factoryName,
      address,
      workersCount,
      ownerEmail,
      phone,
      loginEmail,
      password,
    } = req.body;

    // Validate required fields
    if (!factoryName || !address || !workersCount || !ownerEmail || !phone || !loginEmail || !password) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: loginEmail.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Check if factory name already exists
    const existingTenant = await Tenant.findOne({ factoryName });
    if (existingTenant) {
      res.status(400).json({
        success: false,
        message: 'Factory name already exists',
      });
      return;
    }


    // Create tenant
    const tenant = await Tenant.create({
      factoryName,
      address,
      workersCount,
      ownerEmail,
      phone,
      status: 'pending',
    });




    // Generate unique auto ID for factory admin
    const timestamp = Date.now().toString().slice(-6);
    const autoId = `ADM${timestamp}`;



    // Create factory admin user
    const user = await User.create({
      autoId,
      name: `${factoryName} Admin`,
      email: loginEmail.toLowerCase(),
      mobile: phone,
      password,
      role: 'factory_admin',
      tenantId: tenant._id,
      isActive: true,
    });



    res.status(201).json({
      success: true,
      message: 'Factory registration submitted for approval',
      data: {
        tenantId: tenant._id,
        userId: user._id,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};