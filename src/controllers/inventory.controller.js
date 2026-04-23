import pkg from 'express';
const { Request, Response } = pkg;
import { prisma } from '../services/prisma.service.js';

export const inventoryController = {
  async createProduct(req, res) {
    const product = await prisma.product.create({
      data: req.body,
    });

    res.json(product);
  },

  async getProducts(req, res) {
    const products = await prisma.product.findMany();
    res.json(products);
  },
};