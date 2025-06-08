import { useApi } from "./useApi";
import { User, CreateUserPayload } from "./types";

export type UpdateUserPayload = Partial<CreateUserPayload>;

export function useUserApi() {

    const api = useApi<User | User[]>();

    const getUsers = async () => {
        return api.get<User[]>('/users');
    };

    const getUserById = async (id: string) => {
        return api.get<User>(`/users/${id}`);
    };

    const getUserByEmail = async (email: string) => {
        return api.get<User>(`/users/email/${encodeURIComponent(email)}`);
    };

    const createUser = async (userData: CreateUserPayload) => {
        return api.post<User>('/users', userData);
    };

    const updateUser = async (email: string, userData: UpdateUserPayload) => {
        return api.put<User>(`/users/email/${encodeURIComponent(email)}`, userData);
    };

    return {
        users: Array.isArray(api.data) ? api.data : null,
        user: !Array.isArray(api.data) ? api.data : null,
        error: api.error,
        loading: api.loading,
        getUsers,
        getUserById,
        getUserByEmail,
        createUser,
        updateUser
    };
}

