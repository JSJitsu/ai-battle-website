exports.up = function(knex) {
    return Promise.all([
        knex.schema.raw(`
            CREATE TABLE "session" (
                "sid" varchar NOT NULL COLLATE "default",
                "sess" json NOT NULL,
                "expire" timestamp(6) NOT NULL
            )
            WITH (OIDS=FALSE);

            ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

            CREATE INDEX "IDX_session_expire" ON "session" ("expire");
        `)
    ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('session')
  ])
};
