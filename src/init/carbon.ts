import { Carbon } from "carbon-typescript-sdk";

import { env } from "@/env";

class CarbonClient {
  private constructor() {}

  static withCompanyId(companyId: string) {
    return new Carbon({
      apiKey: env.CARBON_API_KEY,
      customerId: companyId,
    });
  }
}

export default CarbonClient;
