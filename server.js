import express from "express";
import cors from "cors";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

// Função para gerar data e hora do Brasil (sem bug de fuso)
function getDateTimeBR() {
  const now = new Date();

  // Garante o horário em UTC-3 (Brasília)
  const options = { timeZone: "America/Sao_Paulo" };
  const date = now.toLocaleDateString("pt-BR", options);
  const time = now.toLocaleTimeString("pt-BR", { ...options, hour: "2-digit", minute: "2-digit" });

  return { date, time };
}

// Rota raiz
app.get("/", (req, res) => {
  res.send("API rodando com Prisma e MongoDB! 🚀");
});

// Registrar localização
app.post("/location", async (req, res) => {
  const { uid, room } = req.body;

  if (!uid || !room) {
    return res.status(400).json({ message: "Dados incompletos!" });
  }

  const { date, time } = getDateTimeBR();

  try {
    const newLocation = await prisma.location.create({
      data: { uid, room, date, time }
    });

    res.status(201).json({
      message: "Localização registrada com sucesso",
      newLocation
    });
  } catch (err) {
    console.error("Erro ao salvar localização:", err);
    res.status(500).json({ message: "Erro ao salvar localização" });
  }
});

// Última localização
app.get("/location/last", async (req, res) => {
  try {
    const locations = await prisma.location.findMany();

    if (!locations.length) {
      return res.status(404).json({ message: "Nenhuma localização encontrada" });
    }

    const last = locations[locations.length - 1]; // Pega o último inserido no banco
    res.json(last);
  } catch (err) {
    console.error("Erro ao buscar última localização:", err);
    res.status(500).json({ message: "Erro ao buscar a última localização" });
  }
});

// Histórico completo
app.get("/location/history", async (req, res) => {
  try {
    const history = await prisma.location.findMany();

    if (!history.length) {
      return res.status(404).json({ message: "Nenhum histórico encontrado" });
    }

    res.json(history);
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ message: "Erro ao buscar o histórico" });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
