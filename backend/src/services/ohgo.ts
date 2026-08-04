import { env } from '../config/env';
import {
   OhgoApiResponse,
   Construction,
   Incident,
   DangerousSlowDown,
   WZDX_4_2,
} from '../types/ohgo';

const OHGO_BASE_URL = 'https://publicapi.ohgo.com/api/v1';
const OHGO_WZDX_URL = 'https://publicapi.ohgo.com/api/work-zones/wzdx/4.2';

async function fetchOhgo<T>(
   url: string,
   params?: Record<string, string | number | boolean>
): Promise<T> {
   const urlObj = new URL(url);

   if (params) {
      Object.entries(params).forEach(([key, val]) => {
         if (val !== undefined && val !== null) {
            urlObj.searchParams.append(key, String(val));
         }
      });
   }

   const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
         'Authorization': `APIKEY ${env.OHGO_API_KEY}`,
         'Accept': 'application/json',
      }
   });

   if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
         `OHGO API Error (${response.status} ${response.statusText}: ${errorText})`
      );
   }

   return (await response.json()) as T;
}

export const ohgoService = {
   async getConstruction(
      params?: Record<string, string | number | boolean>
   ): Promise<OhgoApiResponse<Construction>> {
      return fetchOhgo<OhgoApiResponse<Construction>>(
         `${OHGO_BASE_URL}/construction`,
         params
      );
   },

   async getIncidents(
      params?: Record<string, string | number | boolean>
   ): Promise<OhgoApiResponse<Incident>> {
      return fetchOhgo<OhgoApiResponse<Incident>>(
         `${OHGO_BASE_URL}/incidents`,
         params
      );
   },

   async getDangerousSlowdowns(
      params?: Record<string, string | number | boolean>
   ): Promise<OhgoApiResponse<DangerousSlowDown>> {
      return fetchOhgo<OhgoApiResponse<DangerousSlowDown>>(
         `${OHGO_BASE_URL}/dangerous-slowdowns`,
         params
      )
   },

   async getWzdxFeed(): Promise<WZDX_4_2> {
      return fetchOhgo<WZDX_4_2>(OHGO_WZDX_URL);
   }
};
