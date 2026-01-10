import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier: string;
    api_calls_used: number;
    api_calls_limit: number;
  };
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, tier, api_calls_used, api_calls_limit')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function checkApiQuota(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.api_calls_used >= req.user.api_calls_limit) {
      return res.status(429).json({
        error: 'API quota exceeded',
        used: req.user.api_calls_used,
        limit: req.user.api_calls_limit
      });
    }

    // Increment API call counter
    await supabase
      .from('users')
      .update({ api_calls_used: req.user.api_calls_used + 1 })
      .eq('id', req.user.id);

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check quota' });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
}
