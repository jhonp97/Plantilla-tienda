import type { Request, Response, NextFunction } from 'express';
import type { CreateAddressUseCase } from '@modules/order/application/use-cases/address/CreateAddressUseCase';
import type { UpdateAddressUseCase } from '@modules/order/application/use-cases/address/UpdateAddressUseCase';
import type { DeleteAddressUseCase } from '@modules/order/application/use-cases/address/DeleteAddressUseCase';
import type { ListUserAddressesUseCase } from '@modules/order/application/use-cases/address/ListUserAddressesUseCase';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AddressController {
  constructor(
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly listUserAddressesUseCase: ListUserAddressesUseCase,
  ) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Stub implementation - returns the input for now
      res.status(201).json({
        success: true,
        data: req.body,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: req.body,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'Address deleted',
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
}