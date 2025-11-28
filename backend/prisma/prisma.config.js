
module.exports = {
    schema: './prisma/schema.prisma',
    datasources: {
        db: {
            provider: 'postgresql',
            url: process.env.DATABASE_URL,
        },
    },
    generators: {
        client: {
            provider: 'prisma-client-js',
        },
    },
};
