import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { Product } from '../models/Product';
import { ProcessStage } from '../models/ProcessStage';
import { Task } from '../models/Task';
import { config } from '../config/environment';

const seedData = async (): Promise<void> => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });



    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Tenant.deleteMany({}),
      Product.deleteMany({}),
      ProcessStage.deleteMany({}),
      Task.deleteMany({}),
    ]);

    // Create Super Admin
    const superAdmin = await User.create({
      autoId: 'SA001',
      name: 'Super Admin',
      email: 'superadmin@factory.com',
      mobile: '+1234567890',
      password: 'password123',
      role: 'super_admin',
      isActive: true,
    });

    // Create Demo Tenant
    const demoTenant = await Tenant.create({
      factoryName: 'Demo Factory',
      address: '123 Industrial Ave, Factory City, FC 12345',
      workersCount: 150,
      ownerEmail: 'owner@demo-factory.com',
      phone: '+1234567891',
      status: 'active',
      approvedAt: new Date(),
    });

    // Create Factory Admin
    const factoryAdmin = await User.create({
      autoId: 'ADM001',
      name: 'Factory Admin',
      email: 'admin@demo-factory.com',
      mobile: '+1234567891',
      password: 'password123',
      role: 'factory_admin',
      tenantId: demoTenant._id,
      isActive: true,
    });

    // Create Supervisor
    const supervisor = await User.create({
      autoId: 'SUP001',
      name: 'John Supervisor',
      email: 'supervisor@demo-factory.com',
      mobile: '+1234567892',
      password: 'password123',
      role: 'supervisor',
      tenantId: demoTenant._id,
      isActive: true,
    });

    // Create Employee
    const employee = await User.create({
      autoId: 'EMP001',
      name: 'Jane Employee',
      email: 'employee@demo-factory.com',
      mobile: '+1234567893',
      password: 'password123',
      role: 'employee',
      tenantId: demoTenant._id,
      isActive: true,
    });

    // Create Products
    const steelBeam = await Product.create({
      tenantId: demoTenant._id,
      name: 'Steel Beam A100',
      description: 'High-strength structural steel beam for construction projects',
      isActive: true,
    });

    const steelPipe = await Product.create({
      tenantId: demoTenant._id,
      name: 'Steel Pipe B200',
      description: 'Seamless steel pipe for industrial applications',
      isActive: true,
    });

    // Create Process Stages for Steel Beam
    const cuttingStage = await ProcessStage.create({
      productId: steelBeam._id,
      tenantId: demoTenant._id,
      name: 'Cutting',
      description: 'Cut raw materials to size',
      order: 1,
      isActive: true,
    });

    const weldingStage = await ProcessStage.create({
      productId: steelBeam._id,
      tenantId: demoTenant._id,
      name: 'Welding',
      description: 'Weld components together',
      order: 2,
      isActive: true,
    });

    const qualityStage = await ProcessStage.create({
      productId: steelBeam._id,
      tenantId: demoTenant._id,
      name: 'Quality Check',
      description: 'Final inspection',
      order: 3,
      isActive: true,
    });

    // Create Process Stages for Steel Pipe
    const formingStage = await ProcessStage.create({
      productId: steelPipe._id,
      tenantId: demoTenant._id,
      name: 'Forming',
      description: 'Shape the pipe',
      order: 1,
      isActive: true,
    });

    const assemblyStage = await ProcessStage.create({
      productId: steelPipe._id,
      tenantId: demoTenant._id,
      name: 'Assembly',
      description: 'Assemble components',
      order: 2,
      isActive: true,
    });

    // Create Sample Tasks
    await Task.create({
      tenantId: demoTenant._id,
      employeeId: employee._id,
      productId: steelBeam._id,
      processStageId: weldingStage._id,
      targetQty: 50,
      completedQty: 35,
      status: 'active',
      deadlineWeek: '2024-W03',
      deadline: new Date('2024-01-21T23:59:59Z'),
      notes: 'Focus on quality control',
      assignedBy: supervisor._id,
      assignedAt: new Date(),
    });

    await Task.create({
      tenantId: demoTenant._id,
      employeeId: employee._id,
      productId: steelPipe._id,
      processStageId: assemblyStage._id,
      targetQty: 30,
      completedQty: 30,
      status: 'completed',
      deadlineWeek: '2024-W02',
      deadline: new Date('2024-01-14T23:59:59Z'),
      assignedBy: supervisor._id,
      assignedAt: new Date('2024-01-08T09:00:00Z'),
      completedAt: new Date('2024-01-12T17:30:00Z'),
    });

    // Create Pending Tenant for Super Admin testing
    await Tenant.create({
      factoryName: 'Pending Factory',
      address: '456 Manufacturing St, Factory City, FC 12346',
      workersCount: 75,
      ownerEmail: 'owner@pending-factory.com',
      phone: '+1234567894',
      status: 'pending',
    });



  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

export { seedData };