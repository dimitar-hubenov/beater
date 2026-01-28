import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.d.ts',
                '**/*.test.*'
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                statements: 70
            }
        },
    }
});
