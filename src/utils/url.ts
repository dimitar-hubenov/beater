// src/utils.url.ts

export const publicUrl = (path: string) => {
    return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}