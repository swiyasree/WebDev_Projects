export class Watch {
    _id!: { $oid: string };
    profile_data!: {
      symbol: string;
      company_name: string;
      exchange: string;
      logo: string;
    };
    quote_data!: {
      last_price: number;
      change: number;
      percent_change: number;
      timestamp: number;
    };
  }
  