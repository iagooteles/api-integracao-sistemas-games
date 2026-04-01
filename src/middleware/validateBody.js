function isMissing(value) {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === "string" && value.trim() === "") {
    return true;
  }
  return false;
}

export function requireFields(fieldNames) {
  return (req, res, next) => {
    const missing = fieldNames.filter((name) => isMissing(req.body[name]));

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Campos obrigatórios ausentes ou vazios",
        missing,
      });
    }

    next();
  };
}
