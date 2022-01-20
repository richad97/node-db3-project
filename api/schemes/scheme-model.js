const db = require("../../data/db-config");

function find() {
  // EXERCISE A
  return db("schemes AS sc")
    .leftJoin("steps AS st", "sc.scheme_id", "st.scheme_id")
    .select("sc.*")
    .count("st.step_id as number_of_steps")
    .groupBy("sc.scheme_id")
    .orderBy("sc.scheme_id", "ASC");
}

async function findById(scheme_id) {
  const rows = await db("schemes AS sc")
    .leftJoin("steps AS st", "sc.scheme_id", "st.scheme_id")
    .select("sc.scheme_name", "st.*")
    .where("sc.scheme_id", scheme_id)
    .orderBy("st.step_number", "ASC");

  const result = {
    scheme_id: rows[0].scheme_id,
    scheme_name: rows[0].scheme_name,
    steps:
      rows[0].step_number > 0
        ? rows.map((scheme) => {
            return {
              step_id: scheme.step_id,
              step_number: scheme.step_number,
              instructions: scheme.instructions,
            };
          })
        : [],
  };

  return result;
}

async function findSteps(scheme_id) {
  const rows = await db("schemes AS sc")
    .leftJoin("steps AS st", "sc.scheme_id", "st.scheme_id")
    .select("st.step_id", "st.step_number", "instructions", "sc.scheme_name")
    .where("sc.scheme_id", scheme_id)
    .orderBy("step_number");

  if (!rows[0].step_id) return [];

  return rows;
}

function add(scheme) {
  return db("schemes")
    .insert(scheme)
    .then(([scheme_id]) => {
      return db("schemes").where("scheme_id", scheme_id).first();
    });
}

function addStep(scheme_id, step) {
  return db("steps")
    .insert({
      ...step,
      scheme_id,
    })
    .then(() => {
      return db("steps AS st")
        .join("schemes AS sc", "sc.scheme_id", "st.scheme_id")
        .select("step_id", "step_number", "instructions", "scheme_name")
        .orderBy("step_number", "ASC")
        .where("sc.scheme_id", scheme_id);
    });
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
};
