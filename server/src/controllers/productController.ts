import { Response } from 'express';
import { Product } from '../models/Product';
import { ProcessStage } from '../models/ProcessStage';
import { AuthRequest } from '../types';
import { Types } from 'mongoose';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const showInactive = req.query.showInactive === 'true';

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (!showInactive) {
      query.isActive = true;
    }

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    const productsWithStages = await Promise.all(
      products.map(async (product) => {
        const stages = await ProcessStage.find({ productId: product._id })
          .sort({ order: 1 });
        const productIdString = (product._id as Types.ObjectId).toString();
        return {
          id: productIdString,
          tenantId: (product.tenantId as Types.ObjectId)?.toString(),
          name: product.name,
          description: product.description,
          isActive: product.isActive,
          createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
          stages: stages.map((stage) => ({
            id: (stage._id as Types.ObjectId).toString(),
            productId: (stage.productId as Types.ObjectId)?.toString(),
            name: stage.name,
            description: stage.description,
            order: stage.order,
            isActive: stage.isActive,
          })),
        };
      })
    );

    res.json({
      success: true,
      data: productsWithStages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && product.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Get process stages
    const stages = await ProcessStage.find({ productId: product._id })
      .sort({ order: 1 });

    const productWithStages = {
      id: (product._id as Types.ObjectId).toString(),
      tenantId: (product.tenantId as Types.ObjectId)?.toString(),
      name: product.name,
      description: product.description,
      isActive: product.isActive,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
      stages: stages.map((stage) => ({
        id: (stage._id as Types.ObjectId).toString(),
        productId: (stage.productId as Types.ObjectId)?.toString(),
        name: stage.name,
        description: stage.description,
        order: stage.order,
        isActive: stage.isActive,
      })),
    };

    res.json({
      success: true,
      data: productWithStages,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
      return;
    }

    const product = await Product.create({
      name,
      description,
      tenantId,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: {
          id: (product._id as Types.ObjectId).toString(),
          tenantId: (product.tenantId as Types.ObjectId)?.toString(),
          name: product.name,
          description: product.description,
          isActive: product.isActive,
          createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
          stages: [],
        },
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && product.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    Object.assign(product, updates);
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && product.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getProductStages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && product.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const stages = await ProcessStage.find({ productId }).sort({ order: 1 });

    res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    console.error('Get product stages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createProcessStage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, description, order } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && product.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const stage = await ProcessStage.create({
      productId,
      tenantId: product.tenantId,
      name,
      description,
      order,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Process stage created successfully',
      data: stage,
    });
  } catch (error) {
    console.error('Create process stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateProcessStage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, stageId } = req.params;
    const updates = req.body;

    const stage = await ProcessStage.findOne({ _id: stageId, productId });
    if (!stage) {
      res.status(404).json({
        success: false,
        message: 'Process stage not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && stage.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    Object.assign(stage, updates);
    await stage.save();

    res.json({
      success: true,
      message: 'Process stage updated successfully',
      data: stage,
    });
  } catch (error) {
    console.error('Update process stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const reorderProcessStages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { stageOrders } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && product.tenantId.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Update stage orders
    const updatePromises = stageOrders.map((stageOrder: { id: string; order: number }) =>
      ProcessStage.updateOne(
        { _id: stageOrder.id, productId },
        { order: stageOrder.order }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Process stages reordered successfully',
    });
  } catch (error) {
    console.error('Reorder process stages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};