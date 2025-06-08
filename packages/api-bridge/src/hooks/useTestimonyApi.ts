import { useMemo } from 'react';
import { Testimony, CreateTestimonyPayload } from "./types"; // UpdateTestimonyPayload
import { useApi } from "./useApi";

export function useTestimonyApi() {

    const api = useApi<Testimony | Testimony[]>();

    const getAllTestimonies = async () => {
        return api.get<Testimony[]>('/testimonies');
    };

    const getFeaturedTestimonies = async () => {
        return api.get<Testimony[]>('/testimonies/featured');
    };

    const getTestimonyByEmail = async (email: string) => {
        return api.get<Testimony[]>(`/testimonies/user/${encodeURIComponent(email)}`);
    };

    const createTestimony = async (testimonyData: CreateTestimonyPayload) => {
        return api.post<Testimony>(`/testimonies`, testimonyData);
    };

    /*  OMIT FOR NOW
    const createTestimony = async (id: string, testimonyData: UpdateTestimonyPayload) => {
        return api.put<Testimony>(`/testimonies/${id}`, testimonyData);
    };


    const deleteTestimony = async () => {

    };
     */

    return useMemo(() => ({
        testimonies: Array.isArray(api.data) ? api.data : null,
        testimony: !Array.isArray(api.data) ? api.data : null,
        loading: api.loading,
        getAllTestimonies,
        getFeaturedTestimonies,
        getTestimonyByEmail,
        createTestimony,
    }), [api.data, api.loading]);
}