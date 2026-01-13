import { z } from 'zod';

export const currencySchema = z.object({
  code: z.string().length(3),
  name: z.string(),
  exchange_rate: z.union([z.number(), z.string()]).transform((val) => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
});

export const currenciesSchema = z.array(currencySchema);

export type Currency = z.infer<typeof currencySchema>;
export type CurrenciesSchema = z.infer<typeof currenciesSchema>;
