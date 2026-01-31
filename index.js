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
    "O cheiro que mais odeio é:",
    "A melhor forma de assustar uma criança é:",
    "Meu superpoder inútil seria:",
    "O segredo para um casamento feliz é:",
    "A primeira coisa que eu faria se fosse invisível:",
    "O nome da minha banda de rock seria:"
];

const RESPOSTAS = [
    "Minha dignidade", "Um bode", "Três quilos de lasanha", "O chupa-cú de goianinha",
    "Gente feia", "Boleto vencido", "Um anão bombado", "Meias sujas", "Minha ex",
    "Dor e sofrimento", "Uma pochete", "Calcinha comestível", "Churrasco de gato",
    "Um peido silencioso", "A careca do meu tio", "Um vibrador de ouro", "Minha conta bancária negativa",
    "Um tapinha não dói", "Viagra natural", "Um cadáver no porta-malas", "Fazer amor com o bumbum",
    "Lula Molusco sensual", "O gemidão do zap", "Uma colonoscopia surpresa", "Vender pack do pé",
    "Um alienígena tarado", "Minha coleção de hentai", "Chupar um limão", "Um chute no saco",
    "Cagar no trabalho", "Fingir demência", "Um político honesto"
];

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
            state: 'LOBBY',
            deck: [...RESPOSTAS].sort(() => Math.random() - 0.5),
            currentJudgeIndex: 0,
            currentQuestion: "",
            tableCards: [] // { playerId, text, revealed: false }
        };
        socket.join(roomCode);
        socket.emit('room-created', roomCode);
        console.log(`Sala ${roomCode} criada.`);
    });

    // 2. ENTRAR NA SALA (PLAYER)
    socket.on('join-room', ({ roomCode, playerName }) => {
        const room = rooms[roomCode];
        if (room && room.state === 'LOBBY') {
            // Verifica se nome já existe
            if (room.players.some(p => p.name === playerName)) {
                socket.emit('error', 'Nome já existe nesta sala.');
                return;
            }
            const player = { id: socket.id, name: playerName, score: 0, hand: [] };
            room.players.push(player);
            socket.join(roomCode);

            io.to(roomCode).emit('update-players', room.players);
            socket.emit('joined-success', { playerId: socket.id });
        } else {
            socket.emit('error', 'Sala não encontrada ou jogo já começou.');
        }
    });

    // 3. INICIAR JOGO
    socket.on('start-game', (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Se o deck estiver acabando, reembaralha (excluindo cartas nas mãos)
        if (room.deck.length < room.players.length * 5) {
            room.deck = [...RESPOSTAS].sort(() => Math.random() - 0.5);
        }

        room.tableCards = [];
        room.state = 'PLAYING';

        // Garante que o indice do juiz é válido (caso algm tenha saido)
        if (room.currentJudgeIndex >= room.players.length) {
            room.currentJudgeIndex = 0;
        } else {
            room.currentJudgeIndex = (room.currentJudgeIndex + 1) % room.players.length;
        }

        room.currentQuestion = PERGUNTAS[Math.floor(Math.random() * PERGUNTAS.length)];

        // Distribui Cartas (Mantendo 5 na mão)
        room.players.forEach(player => {
            while (player.hand.length < 5 && room.deck.length > 0) {
                player.hand.push(room.deck.pop());
            }
        });

        const judge = room.players[room.currentJudgeIndex];
        if (!judge) return; // Segurança

        io.to(roomCode).emit('round-start', {
            question: room.currentQuestion,
            judgeId: judge.id,
            judgeName: judge.name
        });

        room.players.forEach(player => {
            io.to(player.id).emit('your-hand', player.hand);
        });
    });

    // 4. JOGAR CARTA
    socket.on('play-card', ({ roomCode, cardText }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'PLAYING') return;

        // Identifica jogador e juiz
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const judgeId = room.players[room.currentJudgeIndex].id;

        // JUIZ NÃO JOGA CARTA
        if (socket.id === judgeId) {
            socket.emit('error', 'O Juiz não joga cartas nesta fase!');
            return;
        }

        // Evita jogar 2x
        if (room.tableCards.find(c => c.playerId === socket.id)) return;

        player.hand = player.hand.filter(c => c !== cardText);
        // Garante que revealed começa false
        room.tableCards.push({ playerId: socket.id, text: cardText, revealed: false });

        io.to(player.id).emit('your-hand', player.hand);
        io.to(roomCode).emit('card-played', room.tableCards.length);

        // Verifica se todos MENOS o juiz jogaram
        const playersToPlay = room.players.filter(p => p.id !== judgeId).length;

        if (room.tableCards.length >= playersToPlay) {
            room.state = 'JUDGING';
            room.tableCards.sort(() => Math.random() - 0.5);
            io.to(roomCode).emit('start-judging', room.tableCards);
        }
    });

    // 5. REVELAR CARTA
    socket.on('reveal-card', ({ roomCode, index }) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Verifica se é o Juiz quem está pedindo
        const judgeId = room.players[room.currentJudgeIndex].id;
        // Opcional: permitir que HOST também revele (útil para testes ou TV touch)
        const isHost = (socket.id === room.hostId);

        if (socket.id !== judgeId && !isHost) return;

        if (room.tableCards[index]) {
            if (!room.tableCards[index].revealed) {
                room.tableCards[index].revealed = true;
                io.to(roomCode).emit('update-table', room.tableCards);
            }
        }
    });

    // 6. ESCOLHER VENCEDOR
    socket.on('choose-winner', ({ roomCode, cardIndex }) => {
        const room = rooms[roomCode];
        const winnerCard = room.tableCards[cardIndex];

        // Só pode escolher carta revelada? Geralmente sim, mas vamos deixar livre.
        if (!winnerCard) return;

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

    // TRATAMENTO DE DESCONEXÃO MAIS ROBUSTO
    socket.on('disconnect', () => {
        console.log('Desconectado:', socket.id);

        // Procura em todas as salas
        Object.keys(rooms).forEach(code => {
            const room = rooms[code];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                const player = room.players[playerIndex];
                room.players.splice(playerIndex, 1);
                io.to(code).emit('update-players', room.players); // Avisa quem sobrou

                // Se ficou sem ninguém, deleta a sala
                if (room.players.length === 0) {
                    delete rooms[code];
                    return;
                }

                // Se o jogo estava rolando...
                if (room.state === 'PLAYING') {
                    // Se foi o Juiz que saiu: Reinicia a rodada? Ou passa a vez?
                    // Simplificação: Reinicia o round para evitar travamento
                    if (room.currentJudgeIndex === playerIndex) {
                        // O juiz saiu. 
                        io.to(code).emit('error', 'O Juiz fugiu! Reiniciando rodada...');
                        // Volta pro lobby ou tenta reiniciar?
                        // Melhor tentar passar o juiz.
                        if (room.currentJudgeIndex >= room.players.length) room.currentJudgeIndex = 0;
                        // Mas o estado PLAYING fica inconsistente. Vamos forçar um force-reset.
                        // Na vdd, o mais simples é verificar se com a saida dele, todos q sobraram ja jogaram.
                    } else {
                        // Se foi um jogador que saiu, verifique se agora todos já jogaram.
                        const judgeId = room.players[room.currentJudgeIndex]?.id;
                        if (!judgeId) return; // Se o juiz tbm n existe mais

                        const playersToPlay = room.players.filter(p => p.id !== judgeId).length;
                        // Remove cartas jogadas por quem saiu (opcional, mas bom pra nao travar)
                        room.tableCards = room.tableCards.filter(c => c.playerId !== socket.id);

                        if (room.tableCards.length >= playersToPlay && playersToPlay > 0) {
                            room.state = 'JUDGING';
                            room.tableCards.sort(() => Math.random() - 0.5);
                            io.to(code).emit('start-judging', room.tableCards);
                        }
                    }
                }
            }
        });
    });
});

// Adicione '0.0.0.0' para liberar acesso externo/emulador
server.listen(3000, '0.0.0.0', () => {
    console.log('SERVER RODANDO NA PORTA 3000 (Aberto para rede)');
});
