// 'use server'
import axios from "axios"

export const useCallApi = async (url: string, data: Record<string, any>) => {
    try {
        const res = await axios.post(url, data);

        return { success: true, data: res.data };
    } catch (e: any) {
        console.error(e?.response?.status, e?.response?.data || e?.message);
        return {
            success: false,
            error: e?.response?.data?.message || e?.message || 'API request failed',
            status: e?.response?.status || null,
        };
    }
};


