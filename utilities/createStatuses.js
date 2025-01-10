const createStatuses = async (db) => {
  try {
    const statuses = ["Not Started", "Started", "Completed", "Deleted"];
    await Promise.all(
      statuses.map((status) =>
        db.Status.findOrCreate({
          where: { status },
          defaults: { status },
        })
      )
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = createStatuses;
