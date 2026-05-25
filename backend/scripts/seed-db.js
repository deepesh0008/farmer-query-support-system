#!/usr/bin/env node
/**
 * Database Seed Script
 * Run this to populate initial data into the database
 * Usage: npm run seed-db
 */

import 'dotenv/config.js';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/database.js';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import OfficerProfile from '../models/OfficerProfile.js';
import Scheme from '../models/Scheme.js';
import Query from '../models/Query.js';
import bcryptjs from 'bcryptjs';
import { default as logger } from '../utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('Starting database seed...');
    
    await connectDB();
    logger.info('Connected to database');

    // Clear existing data (optional - comment out to preserve data)
    // await User.deleteMany({});
    // await Scheme.deleteMany({});
    // logger.info('Cleared existing collections');

    // Seed test users
    const testFarmer = new User({
      email: 'farmer@example.com',
      password: await bcryptjs.hash('FarmerPass123', 10),
      phoneNumber: '9876543210',
      role: 'farmer',
      profile: {
        firstName: 'Rajesh',
        lastName: 'Sharma',
      },
      address: {
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Doraha',
      },
      verification: {
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const testOfficer = new User({
      email: 'officer@example.com',
      password: await bcryptjs.hash('OfficerPass123', 10),
      phoneNumber: '9876543211',
      role: 'officer',
      profile: {
        firstName: 'Priya',
        lastName: 'Singh',
      },
      address: {
        state: 'Punjab',
        district: 'Ludhiana',
      },
      verification: {
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const testAdmin = new User({
      email: 'admin@example.com',
      password: await bcryptjs.hash('AdminPass123', 10),
      phoneNumber: '9876543212',
      role: 'admin',
      profile: {
        firstName: 'Aditya',
        lastName: 'Kumar',
      },
      address: {
        state: 'Punjab',
      },
      verification: {
        emailVerified: true,
        phoneVerified: true,
      },
    });

    // Check if users exist before creating
    const farmerExists = await User.findOne({ email: 'farmer@example.com' });
    const officerExists = await User.findOne({ email: 'officer@example.com' });
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (!farmerExists) {
      await testFarmer.save();
      logger.info('Created test farmer user');
    }

    if (!officerExists) {
      await testOfficer.save();
      logger.info('Created test officer user');
    }

    if (!adminExists) {
      await testAdmin.save();
      logger.info('Created test admin user');
    }

    // Create farmer and officer profiles
    if (testFarmer && !farmerExists) {
      await FarmerProfile.create({
        userId: testFarmer._id,
        farmLocation: {
          latitude: 30.9010,
          longitude: 75.8573,
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Doraha',
        },
        farmDetails: {
          totalLandSize: 5,
          landUnit: 'acres',
          cropsGrown: ['wheat', 'rice', 'cotton'],
          soilType: 'clay-loam',
          irrigationType: 'canal',
        },
        preferredLanguage: 'en',
      });
      logger.info('Created farmer profile');
    }

    if (testOfficer && !officerExists) {
      await OfficerProfile.create({
        userId: testOfficer._id,
        department: 'Agriculture',
        designation: 'Senior Agricultural Officer',
        region: 'Ludhiana',
        assignedVillages: ['Doraha', 'Samrala', 'Jagraon'],
        skills: ['plant-disease-identification', 'pest-management', 'soil-testing'],
      });
      logger.info('Created officer profile');
    }

    // Seed government schemes
    const schemesData = [
      {
        schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        schemeCode: 'PM-KISAN-001',
        schemeType: 'subsidy',
        govtLevel: 'central',
        governmentDepartment: 'Ministry of Agriculture & Farmers Welfare',
        description: 'Income support scheme providing ₹6,000 per year to small and marginal farmers',
        objectives: [
          'Provide income support to farmers',
          'Reduce farming distress',
          'Facilitate capital formation'
        ],
        benefits: {
          subsidy: {
            amount: 6000,
            currency: 'INR',
            percentage: 100
          }
        },
        eligibility: {
          targetBeneficiaries: ['small-farmers', 'marginal-farmers'],
          cropTypes: ['wheat', 'rice', 'corn', 'sugarcane', 'cotton'],
          states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
          annualIncome: { max: 2000000 }
        },
        duration: {
          launchDate: new Date('2019-02-01'),
          applicableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        applicationProcess: {
          mode: ['online', 'offline'],
          stepsToApply: [
            'Register on PM-KISAN portal',
            'Verify land records',
            'Submit application',
            'Await approval'
          ],
          requiredDocuments: ['Aadhaar', 'Land records', 'Bank account details'],
          processingTime: '15-30 days'
        },
        active: true,
        featured: true,
      },
      {
        schemeName: 'Fasal Bima Yojana',
        schemeCode: 'FBY-001',
        schemeType: 'insurance',
        govtLevel: 'central',
        governmentDepartment: 'Ministry of Agriculture & Farmers Welfare',
        description: 'Comprehensive crop insurance scheme against crop losses due to weather, pests, and diseases',
        objectives: [
          'Provide crop insurance coverage',
          'Protect farmers against crop losses',
          'Encourage adoption of modern farming practices'
        ],
        benefits: {
          insurance: {
            premium: 'Variable',
            coverage: 'Up to 80% of loss',
            maxClaim: 100000
          }
        },
        eligibility: {
          targetBeneficiaries: ['all-farmers'],
          cropTypes: ['wheat', 'rice', 'corn', 'sugarcane', 'cotton', 'potato'],
          states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh']
        },
        duration: {
          launchDate: new Date('2016-01-13'),
          applicableSeasons: ['kharif', 'rabi', 'summer']
        },
        applicationProcess: {
          mode: ['online', 'offline'],
          requiredDocuments: ['Land records', 'Insurance documents', 'Proof of residence']
        },
        active: true,
        featured: true,
      },
      {
        schemeName: 'Kisan Credit Card (KCC)',
        schemeCode: 'KCC-001',
        schemeType: 'loan',
        govtLevel: 'central',
        governmentDepartment: 'Ministry of Agriculture & Farmers Welfare',
        description: 'Credit facility for farmers at concessional interest rates',
        objectives: [
          'Provide timely credit to farmers',
          'Reduce dependence on informal credit',
          'Support agricultural activities'
        ],
        benefits: {
          loan: {
            maxAmount: 300000,
            interestRate: '4-7%',
            moratoriumPeriod: '18 months',
            repaymentPeriod: '5 years'
          }
        },
        eligibility: {
          targetBeneficiaries: ['small-farmers', 'marginal-farmers', 'all-farmers'],
          ageLimit: { min: 18, max: 75 }
        },
        active: true,
        featured: true,
      },
      {
        schemeName: 'Soil Health Card Scheme',
        schemeCode: 'SHC-001',
        schemeType: 'grant',
        govtLevel: 'central',
        description: 'Provides soil test reports and fertilizer recommendations to farmers',
        objectives: [
          'Improve soil health and productivity',
          'Promote balanced fertilizer use',
          'Reduce input costs'
        ],
        eligibility: {
          targetBeneficiaries: ['all-farmers'],
          cropTypes: ['all']
        },
        duration: {
          launchDate: new Date('2015-02-19')
        },
        active: true,
        featured: false,
      },
      {
        schemeName: 'Rashtriya Krishi Vikas Yojana',
        schemeCode: 'RKVY-001',
        schemeType: 'grant',
        govtLevel: 'state',
        description: 'State-level agricultural development scheme with multiple focus areas',
        objectives: [
          'Develop agriculture sector',
          'Create rural employment',
          'Improve farm productivity'
        ],
        eligibility: {
          targetBeneficiaries: ['all-farmers'],
          states: ['Punjab', 'Haryana', 'Uttar Pradesh']
        },
        active: true,
        featured: false,
      }
    ];

    // Insert schemes if not already present
    for (const schemeData of schemesData) {
      const schemeExists = await Scheme.findOne({ schemeCode: schemeData.schemeCode });
      if (!schemeExists) {
        await Scheme.create(schemeData);
        logger.info(`Created scheme: ${schemeData.schemeName}`);
      }
    }

    logger.info('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

// Run seed
seedDatabase();
