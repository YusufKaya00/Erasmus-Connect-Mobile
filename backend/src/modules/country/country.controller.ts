import { Request, Response, NextFunction } from 'express';
import { countryService } from './country.service';

export class CountryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;

      let countries;
      if (search && typeof search === 'string') {
        countries = await countryService.searchCountries(search);
      } else {
        countries = await countryService.getAllCountries();
      }

      res.json({
        success: true,
        data: countries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const country = await countryService.getCountryById(id);

      if (!country) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'COUNTRY_NOT_FOUND',
            message: 'Country not found',
          },
        });
      }

      res.json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, flagSvg } = req.body;
      const country = await countryService.createCountry({ name, code, flagSvg });

      res.status(201).json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, code, flagSvg } = req.body;
      const updatedCountry = await countryService.updateCountry(id, { name, code, flagSvg });

      res.json({
        success: true,
        data: updatedCountry,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await countryService.deleteCountry(id);

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const countryController = new CountryController();

