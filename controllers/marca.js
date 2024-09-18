const Marca = require("../models/marca");
const db = require("../util/database");

exports.createMarca = async (req, res) => {
  const { nome_marca } = req.body;

  if (!nome_marca) {
    return res.status(400).json({ message: "Nome da marca é obrigatório" });
  }

  try {
    const novaMarca = new Marca(null, nome_marca);

    const result = await novaMarca.save();

    if (result.insertId) {
      return res.status(201).json({
        message: "Marca criada com sucesso",
        marcaId: result.insertId,
      });
    } else {
      throw new Error("Erro ao obter o ID da marca após a inserção.");
    }
  } catch (error) {
    console.error("Erro ao criar marca:", error);
    res.status(500).json({ message: "Erro ao criar marca" });
  }
};

exports.updateMarca = async (req, res) => {
  const { id } = req.params;
  const { nome_marca } = req.body;

  if (!nome_marca || !id) {
    return res
      .status(400)
      .json({ message: "Nome e ID da marca são obrigatórios" });
  }

  try {
    const atualizarMarca = new Marca(id, nome_marca);

    const result = await atualizarMarca.update();

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "Marca atualizada com sucesso",
        marcaId: id,
      });
    } else {
        return res.status(404).json({ message: "Marca não encontrada" });
    };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ message: "Erro ao atualizar produto" });
  }
};

exports.deleteMarca = async (req, res) => {
  const { id } = req.params; //Precisa ser 'id' pois é o que está na routes delete/:id

  if (!id) {
    return res.status(400).json({ message: "ID da marca é obrigatório" });
  }

  try {
    const result = await Marca.delete(id);

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Marca deletada com sucesso" });
    } else {
      return res.status(404).json({ message: "Marca não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ message: "Erro ao deletar produto" });
  };
};

exports.listMarcas = async (req, res) => {

  try {
    const marcas = await Marca.read();

    if (marcas.length > 0) {
      return res.status(200).json(marcas);
    } else {
      return res.status(404).json({ message: "Nenhuma marca encontrada" });
    }
  } catch (error) {
    console.error("Erro ao listar marcas:", error);
    return res.status(500).json({ message: "Erro ao listar marcas" });
  };
};
