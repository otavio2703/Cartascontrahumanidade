// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permite conexões do Flutter e React
        methods: ["GET", "POST"]
    }
});

// --- DADOS DO JOGO (MOCK PARA MVP) ---
const PERGUNTAS = [
    "O que eu escondo debaixo da cama?",
    "Motivo do meu último término:",
    "A nova moda entre os jovens é:",
    "Para o jantar, teremos:",
    "O cheiro que mais odeio é:"
];

const RESPOSTAS = [
    "Minha dignidade", "Um bode", "Três quilos de lasanha", "O chupa-cú de goianinha",
    "Gente feia", "Boleto vencido", "Um anão bombado", "Meias sujas", "Minha ex",
    "Dor e sofrimento", "Uma pochete", "Calcinha comestível", "Churrasco de gato"
];

// --- ESTADO DO JOGO EM MEMÓRIA ---
// Estrutura: { roomCode: { players: [], state: 'LOBBY', deck: [], currentJudge: 0, currentQ: "", playedCards: [] } }
const rooms = {};

const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // 1. CRIAR SALA (HOST)
    socket.on('create-room', () => {
        const roomCode = generateCode();
        rooms[roomCode] = {
            hostId: socket.id,
            players: [], // { id, name, score, hand: [] }
            state: 'LOBBY', // LOBBY, PLAYING, JUDGING, RESULT
            deck: [...RESPOSTAS].sort(() => Math.random() - 0.5), // Embaralha
            currentJudgeIndex: 0,
            currentQuestion: "",
            tableCards: [] // { playerId, cardText, hidden: true }
        };
        socket.join(roomCode);
        socket.emit('room-created', roomCode);
        console.log(`Sala ${roomCode} criada.`);
    });

    // 2. ENTRAR NA SALA (PLAYER)
    socket.on('join-room', ({ roomCode, playerName }) => {
        const room = rooms[roomCode];
        if (room && room.state === 'LOBBY') {
            const player = { id: socket.id, name: playerName, score: 0, hand: [] };
            room.players.push(player);
            socket.join(roomCode);
            
            // Avisa o Host e o Player
            io.to(roomCode).emit('update-players', room.players);
            socket.emit('joined-success', { playerId: socket.id });
        } else {
            socket.emit('error', 'Sala não encontrada ou jogo já começou.');
        }
    });

    // 3. INICIAR JOGO / PRÓXIMA RODADA
    socket.on('start-game', (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Reset da mesa
        room.tableCards = [];
        room.state = 'PLAYING';
        
        // Define Juiz e Pergunta
        room.currentJudgeIndex = (room.currentJudgeIndex + 1) % room.players.length;
        room.currentQuestion = PERGUNTAS[Math.floor(Math.random() * PERGUNTAS.length)];

        // Distribui Cartas (Sempre mantendo 5 na mão)
        room.players.forEach(player => {
            while (player.hand.length < 5 && room.deck.length > 0) {
                player.hand.push(room.deck.pop());
            }
        });

        const judgeId = room.players[room.currentJudgeIndex].id;

        // Envia estado atualizado pra todo mundo
        io.to(roomCode).emit('round-start', {
            question: room.currentQuestion,
            judgeId: judgeId,
            judgeName: room.players[room.currentJudgeIndex].name
        });

        // Envia cartas privadas para cada jogador
        room.players.forEach(player => {
            io.to(player.id).emit('your-hand', player.hand);
        });
    });

    // 4. JOGAR CARTA (PLAYER)
    socket.on('play-card', ({ roomCode, cardText }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'PLAYING') return;

        // Remove da mão
        const player = room.players.find(p => p.id === socket.id);
        player.hand = player.hand.filter(c => c !== cardText);

        // Adiciona à mesa (anônimo por enquanto)
        room.tableCards.push({ playerId: socket.id, text: cardText, revealed: false });

        io.to(player.id).emit('your-hand', player.hand); // Atualiza mão do player
        io.to(roomCode).emit('card-played', room.tableCards.length); // Avisa host qts jogaram

        // Se todos (menos o juiz) jogaram, muda para fase de julgamento
        if (room.tableCards.length === room.players.length - 1) {
            room.state = 'JUDGING';
            // Embaralha as cartas da mesa para anonimato real
            room.tableCards.sort(() => Math.random() - 0.5);
            io.to(roomCode).emit('start-judging', room.tableCards);
        }
    });

    // 5. REVELAR CARTA (HOST ou JUIZ clica para ver)
    socket.on('reveal-card', ({ roomCode, index }) => {
        const room = rooms[roomCode];
        if(room && room.tableCards[index]) {
            room.tableCards[index].revealed = true;
            io.to(roomCode).emit('update-table', room.tableCards);
        }
    });

    // 6. ESCOLHER VENCEDOR (JUIZ)
    socket.on('choose-winner', ({ roomCode, cardIndex }) => {
        const room = rooms[roomCode];
        const winnerCard = room.tableCards[cardIndex];
        const winner = room.players.find(p => p.id === winnerCard.playerId);
        
        if (winner) {
            winner.score += 1;
            room.state = 'RESULT';
            io.to(roomCode).emit('round-winner', {
                winnerName: winner.name,
                winningCard: winnerCard.text,
                scores: room.players
            });
        }
    });

    socket.on('disconnect', () => {
        // Lógica simples de desconexão (pode ser melhorada depois)
        console.log('Desconectado:', socket.id);
    });
});

// Adicione '0.0.0.0' para liberar acesso externo/emulador
server.listen(3000, '0.0.0.0', () => {
    console.log('SERVER RODANDO NA PORTA 3000 (Aberto para rede)');
});