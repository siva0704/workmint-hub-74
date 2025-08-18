import { Response } from 'express';
import { Product } from '../models/Product';
import { ProcessStage } from '../models/ProcessStage';
import { AuthRequest } from '../types';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tenantId = req.query.tenantId as string || req.user?.tenantId;

    const query: any = {};
    if (tenantId) query.tenantId = tenantId;

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    // Get stages for each product
    const productsWithStages = await Promise.all(
      products.map(async (product) => {
        const stages = await ProcessStage.find({ productId: product._id })
          .sort({ order: 1 });
        return {
          ...product.toJSON(),
          stages: stages.map(stage => stage.toJSON()),
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

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const tenantId = req.user?.tenantId;

    const product = await Product.create({
      name,
      description,
      tenantId,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
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