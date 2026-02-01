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
    "No próximo Globo Repórter: Onde vivem? O que comem? Como se reproduzem? Hoje, falaremos sobre ____.",
    "Para seduzir alguém no Tinder, eu sempre uso ____.",
    "O que o Faustão esconde por trás daquelas camisas de marca?",
    "A nova modalidade das Olimpíadas de 2028 será o arremesso de ____.",
    "O motivo do meu último término de namoro foi ____.",
    "Qual é o ingrediente secreto da feijoada da minha avó?",
    "Na minha infância, meu maior medo era ____.",
    "A nova promessa do governo para melhorar a economia é distribuir ____ para todos.",
    "Doutor, eu estou sentindo uma dor aguda toda vez que eu toco em ____.",
    "O que eu trouxe de presente da minha viagem para o Paraguai?",
    "A única coisa capaz de salvar o Brasil hoje é ____.",
    "O que o Batman guarda no seu cinto de utilidades?",
    "____: É por isso que eu bebo!",
    "Qual é a primeira coisa que o Papa faz quando acorda?",
    "A minha próxima tatuagem vai ser uma imagem de ____.",
    "O que não pode faltar em um churrasco de domingo?",
    "Minha vida amorosa pode ser resumida em: ____.",
    "O que o Silvio Santos joga para a plateia quando as 'aviõezinhas' acabam?",
    "Minha estratégia para sobreviver ao apocalipse zumbi é ____.",
    "Qual é o verdadeiro motivo do sumiço do Menino do Acre?",
    "No meu tempo, as crianças se divertiam com ____.",
    "O que eu encontrei escondido debaixo da cama da minha sogra?",
    "A nova sensação do TikTok é fazer dancinha enquanto segura ____.",
    "Não sei o que é pior: segunda-feira ou ____.",
    "O que causou o 7 a 1 contra a Alemanha?",
    "Qual é a melhor forma de gastar o FGTS?",
    "A ciência comprovou: o uso excessivo de ____ causa calvície.",
    "O que o agiota vai levar de mim se eu não pagar hoje?",
    "A nova tendência de moda no Lollapalooza é usar ____ como acessório.",
    "O que me faz chorar no banho?",
    "____: O novo sabor de sorvete da Kibon.",
    "O que os vizinhos estão fofocando sobre mim no grupo do condomínio?",
    "Qual é o segredo para um casamento duradouro?",
    "Se eu fosse um super-herói, meu ponto fraco seria ____.",
    "O que eu vi pela fechadura do quarto dos meus pais?",
    "____: A verdadeira causa da extinção dos dinossauros.",
    "Qual é o tema da próxima novela das nove?",
    "O que acontece em Vegas fica em Vegas. O que acontece em Xerém envolve ____.",
    "A única coisa que me impede de virar um mendigo é ____.",
    "Minha última pesquisa no Google foi: 'Como curar ____ em 24 horas'.",
    "O que o Elon Musk vai enviar para Marte em 2026?",
    "Qual é o prêmio máximo do próximo Big Brother Brasil?",
    "A maior vergonha da minha vida foi quando eu fui pego com ____.",
    "O que o Padre Marcelo Rossi faz para ficar tão bombado?",
    "A receita para um final de semana inesquecível envolve álcool e ____.",
    "O que é que a baiana tem?",
    "Como eu pretendo ficar rico sem trabalhar?",
    "Qual será a próxima polêmica envolvendo a Família Real?",
    "O que realmente tem dentro de uma salsicha?",
    "A nova religião que mais cresce no Brasil adora ____.",
    "O que eu faria por um milhão de reais?",
    "O que o despertador me impediu de terminar de fazer no sonho?",
    "Qual é o cheiro do inferno?",
    "____: O presente ideal para o Dia das Mães.",
    "O que os terraplanistas acreditam que existe na borda do mundo?",
    "Minha dieta consiste em 50% de água e 50% de ____.",
    "O que eu vou pedir para o gênio da lâmpada?",
    "O que é que o bicho-papão faz no tempo livre?",
    "Qual é o som que eu faço na hora do sexo?",
    "____: A solução definitiva para o trânsito de São Paulo.",
    "O que eu encontrei no bolso da calça que não lavo há meses?",
    "A nova regra do futebol diz que o VAR pode ser substituído por ____.",
    "Qual é o maior luxo de um pobre?",
    "A primeira coisa que eu faria se fosse invisível por um dia seria ____.",
    "O que é que está deixando os jovens tão deprimidos hoje em dia?",
    "O que eu vou escrever na minha lápide?",
    "Se a vida te der limões, jogue neles ____.",
    "O que os gatos pensam quando olham para a gente?",
    "____: A única coisa que o dinheiro não compra, mas ajuda a disfarçar.",
    "Qual é o verdadeiro significado da palavra 'embuste'?",
    "O que acontece quando você aperta o botão vermelho?",
    "O que eu usaria para subornar um policial?",
    "Qual é a pior coisa para se encontrar no meio de um sanduíche?",
    "A minha habilidade especial no currículo é ____.",
    "O que me faz perder a fé na humanidade?",
    "A próxima parada do caminhão do lixo é na casa de ____.",
    "O que eu escondo quando a visita chega?",
    "____: O motivo pelo qual eu não sou mais convidado para festas de família.",
    "Qual é a primeira coisa que eu faria se ganhasse na Mega-Sena?",
    "O que o espelho me disse hoje de manhã?",
    "____: O novo símbolo de status social.",
    "O que eu faria se o mundo acabasse amanhã?",
    "Qual é a coisa mais estranha que você já viu em um transporte público?",
    "A minha banda favorita de rock morreu de overdose de ____.",
    "O que eu não desejaria nem para o meu pior inimigo?",
    "A prova de que Deus tem senso de humor é ____.",
    "O que eu levaria para uma ilha deserta?",
    "____: O novo curso do Senai.",
    "Qual é a maior mentira que eu já contei para sair de um compromisso?",
    "O que é que o Wi-Fi da minha casa está tentando me dizer?",
    "A minha crise de meia-idade vai ser marcada por ____.",
    "O que eu faço quando ninguém está olhando?",
    "____: O verdadeiro segredo da felicidade.",
    "Qual é o nome do meu futuro canal no YouTube?",
    "O que o Papai Noel faz com as crianças que não se comportam?",
    "____: A causa da minha gastrite.",
    "O que eu sinto quando vejo o preço da gasolina?",
    "A nova linha de perfumes da Jequiti tem cheiro de ____.",
    "O que é que os políticos fazem durante o horário eleitoral?",
    "____: O principal motivo de briga no grupo da família.",
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
    "Minha dignidade", "Um bode", "Três quilos de lasanha", "O chupa-cu de goianinha",
    "Gente feia", "Boleto vencido", "Um anão bombado", "Meias sujas", "Minha ex",
    "Dor e sofrimento", "Uma pochete", "Calcinha comestível", "Churrasco de gato",
    "Um peido silencioso", "A careca do meu tio", "Um vibrador de ouro", "Minha conta bancária negativa",
    "Um tapinha não dói", "Viagra natural", "Um cadáver no porta-malas", "Fazer amor com o bumbum",
    "Lula Molusco sensual", "O gemidão do zap", "Uma colonoscopia surpresa", "Vender pack do pé",
    "Um alienígena tarado", "Minha coleção de hentai", "Chupar um limão", "Um chute no saco",
    "Cagar no trabalho", "Fingir demência", "Um político honesto", "O Faustão pelado",
    "Beijar o espelho", "Água de salsicha", "Um canudinho de plástico no olho", "A grávida de Taubaté",
    "Dormir de calça jeans", "Passar mal no ônibus", "O ET de Varginha", "Um Pix de 2 reais",
    "Banheira do Gugu", "Lamber o corrimão do metrô", "Papel higiênico folha simples", "Cuscuz paulista",
    "O mico-leão-dourado", "Fofão da Carreta Furacão", "Miojo cru", "Uma sandália Crocs",
    "Um soco na costela", "A herança da minha avó", "Demitir todo mundo", "Um tumor benigno",
    "Pão com ovo", "O Kid Bengala", "Usar o Jequiti do pai", "Uma massagem com final feliz",
    "Esquecer o nome da pessoa no ato", "Um chá de revelação que termina em incêndio", "O Inri Cristo",
    "Apertar a espinha nas costas alheias", "Cuspir no prato que comeu", "Um dildo de 30 centímetros",
    "Fingir que está dormindo no ônibus", "A loira do banheiro", "Voz de bebê na hora H",
    "Cheiro de suvaco", "Um vira-lata caramelo", "Comer o reboco da parede", "A Carreta Furacão",
    "Soro caseiro", "Uma voadora no peito", "O agiota batendo na porta", "Fazer um bico de palhaço",
    "Um testículo só", "Pasta de dente com suco de laranja", "O Ursinho Pooh comunista",
    "Um robô aspirador assassino", "Mandioca", "Um curso do Primo Rico", "NFT de macaco",
    "Cerveja quente", "A Gretchen", "Um vibrador que toca o hino nacional", "O fantasma do comunismo",
    "Comprar cigarro e nunca mais voltar", "Morder a língua", "Uma cueca freada",
    "O Rei do Camarote", "Leite de burra", "A Estátua da Liberdade da Havan", "Uma hemorroida inflamada",
    "Dançar a boquinha da garrafa", "O Louro José", "Um grupo de K-Pop", "Sequestro relâmpago",
    "O berrante do Sérgio Reis", "Um filtro do Instagram", "A Jojo Todynho", "Sopa de pedra",
    "Um pênis de borracha perdido no mar", "O Chaves metalúrgico", "Um coach quântico",
    "Ter ereção durante um funeral", "O elenco de Malhação de 2004", "Cheirar rapé",
    "Um jantar romântico no Habib's", "A Sandy", "O Júnior", "Pagar com nota de 200 reais",
    "Um enema de café", "O Capitão Nascimento", "Uma horda de zumbis", "A Xuxa só para baixinhos",
    "Um micro-ondas que não esquenta o meio", "O Galvão Bueno narrando meu sexo",
    "Um mamilo polêmico", "Fazer cosplay de árvore", "O Kleber Bambam", "O boneco do posto",
    "Uma infiltração no teto", "Dormir na rede e cair", "O Padre Marcelo Rossi bombado",
    "Uma sunga de crochê", "O Zeca Pagodinho", "Um pote de sorvete cheio de feijão",
    "Pedir um iFood e o motoboy comer", "O Michael Jackson brasileiro", "Um fetiche por pés",
    "A loira do Tchan", "O moreno do Tchan", "Uma festa estranha com gente esquisita",
    "O Chucky brasileiro", "Viver de luz", "Um chá de cogumelo", "A técnica do pompoarismo",
    "O Velho da Havan", "Uma dancinha do TikTok no meio do velório", "O exército de terracota",
    "A Gracyanne Barbosa", "Um suplemento de cavalo", "Fazer crossfit", "O mestre dos magos",
    "Uma enchente em São Paulo", "Um banho de assento", "O Pica-pau descendo a catarata",
    "Um vibrador com Bluetooth", "A fada do dente", "Um anão vestido de Batman",
    "O Ronaldinho Gaúcho em um rolê aleatório", "Uma freira de patins", "O boneco do Dollynho",
    "Um mendigo gato", "O teste do DNA do Ratinho", "Uma suruba de idosos", "O comercial da Dolly",
    "Um dente de ouro", "A mulher do Google", "O som do modem discado", "Um peido na igreja",
    "O golpe do bilhete premiado", "Uma massagem tailandesa", "O sósia do Neymar",
    "Um comercial da Tekpix", "A faca que corta o sapato", "O mestre de obras", "Um gótico suave",
    "O vampiro de Curitiba", "Uma noite de núpcias no motel barato", "O Curupira de salto alto",
    "Um tamanco de madeira", "A moça do tempo", "O Seu Jorge", "Um celta rebaixado",
    "A sogra morando junto", "Um banho de mangueira", "O Sidney Magal", "Um filme pornô vintage",
    "A Geisy Arruda", "Um picolé de milho verde", "O Silvio Santos", "Uma nota de 3 reais",
    "O Bozo", "Uma máscara de cavalo", "O Narcisa Tamborindeguy", "Um banho gelado no inverno",
    "O hino do Palmeiras", "Uma chinelada da mãe", "O caminhão do gás", "Uma propaganda da Ivete Sangalo",
    "O óleo de peroba", "Uma barata voando", "O bicho-papão", "Um abraço de urso",
    "A técnica do desentupidor", "Um boneco de vudu", "O Rei Pelé", "Uma caneta azul",
    "O Blue Pen", "Um jantar com o Diabo", "A alma do negócio", "Um tapa na cara",
    "O beijo do gordo", "Uma maratona de Grey's Anatomy", "O fim do mundo", "Um café ralo",
    "A tia do Zap", "Um vídeo do Pirulla", "O Castelo Rá-Tim-Bum", "Uma pochete neon",
    "O Gil do Vigor", "Um economista liberal", "A mão invisível do mercado", "O Projac",
    "Uma bota ortopédica", "O lobisomem de Pirituba", "Um jantar de família tenso",
    "O Zé Gotinha", "Uma estátua de gesso de um cachorro", "O cheiro de terra molhada",
    "Um ventilador barulhento", "A música do plantão da Globo", "Um filtro de barro",
    "O Faustão saindo do armário", "Uma lasanha de micro-ondas", "O boneco da Fofão com uma faca",
    "Um carrapato estrela", "A loira do banheiro", "O saci de uma perna só", "Um urubu",
    "A grávida de Taubaté fugindo", "Um vibrador que grita 'Receba!'", "O Luva de Pedreiro",
    "Uma marmita azeda", "O comercial da Jequiti", "Um curso de como ser Alpha",
    "O tapa do Will Smith", "Uma harmonização facial deu errado", "O Elon Musk",
    "Um foguete que explode", "A rainha da sucata", "Um gnomo de jardim", "O saco do Papai Noel",
    "Uma viagem para Praia Grande", "O cheiro de maresia", "Um siri na lata", "A Globeleza",
    "Um bloco de Carnaval", "O carro do ovo", "Uma vovó jogando bingo", "O bingo da igreja",
    "Um bingo de asilo", "O bicho de pé", "Uma coceira no meio da bunda", "O exame de toque",
    "Um clister", "A técnica do copinho", "Um nude indesejado", "O grupo da família",
    "Uma mensagem de voz de 10 minutos", "O áudio do Caneta Azul", "Um vídeo de receita no Reels",
    "O algoritmo do YouTube", "Uma inteligência artificial depressiva", "O ChatGPT",
    "Um robô que quer dominar o mundo", "A skynet brasileira", "Um chip no cérebro",
    "O sinal da Tim", "Uma conta de luz de 500 reais", "O preço da gasolina",
    "Um pão de queijo amanhecido", "A vira-lata que late pra moto", "O motoboy do iFood",
    "Um dogão com purê", "A discussão sobre purê no cachorro-quente", "Um biscoito Globo",
    "O chá da tarde com a rainha", "Um velório com open bar", "O caixão que cai no chão",
    "Um defunto que se mexe", "A necrofilia", "Um fetiche por palhaços", "O It, a coisa",
    "Um balão vermelho", "O palhaço Bozo", "Um show da Carreta Furacão no seu aniversário",
    "O Mário que te comeu atrás do armário", "A tia que pergunta das namoradinhas",
    "O primo que passou em concurso", "Um churrasco na laje", "O sol escaldante do Rio",
    "Um banho de mar com óleo", "O vazamento de petróleo", "Um pinguim perdido",
    "A Sibéria brasileira", "Um dia de neve em Santa Catarina", "O Papai Noel de bermuda",
    "Um peru de Natal seco", "A uva passa no arroz", "O panetone de frutas", "Um chocotone",
    "O amigo secreto de família", "Um par de meias de presente", "O vale-transporte atrasado",
    "O FGTS", "A reforma da previdência", "Um asilo de luxo", "O bingo da terceira idade",
    "Uma dentadura num copo de água", "O cheiro de cânfora", "Um comercial do Cogumelo do Sol",
    "A técnica de cura do Dr. Fritz", "Um médium charlatão", "O pastor da TV",
    "Um exorcismo ao vivo", "A bacia de água benta", "O capeta em forma de guri",
    "Um exorcismo que deu errado", "O padre que balança o incenso", "Uma hóstia grudada no céu da boca",
    "O vinho de missa", "Um sacristão tarado", "A freira que fuma escondido",
    "O segredo do confessionário", "Um pecado mortal", "O inferno de Dante",
    "Uma viagem sem volta para o Acre", "O dinossauro do Acre", "O sumiço do menino do Acre",
    "Uma teoria da conspiração", "O terraplanismo", "Um foguete feito de garrafa PET",
    "A NASA brasileira", "O astronauta Marcos Pontes e seu travesseiro", "Um pé de feijão mágico",
    "O gigante acordou", "Um protesto de 10 pessoas", "O boneco do Pixuleco",
    "Uma camisa da seleção brasileira", "O 7 a 1 contra a Alemanha", "O choro do Neymar",
    "A queda do Neymar", "O rolo do Neymar", "Um cruzeiro do Neymar", "A Bruna Marquezine",
    "O Luana Piovani pistola", "O Dado Dolabella", "Um tapa na cara", "A Maria do Bairro",
    "A Usurpadora", "O segredo de Paola Bracho", "Um veneno de rato", "A cicuta",
    "O Sócrates", "O Platão de sunga", "Uma aula de filosofia", "O Olavo de Carvalho",
    "Um feto no Pepsi", "A Pepsi Blue", "Um refrigerante de uva", "O Dolly Guaraná",
    "O Sol amiguinho", "Uma insolação de terceiro grau", "O câncer de pele",
    "Um dermatologista caro", "O Botox da Gretchen", "A boca da Anitta", "Um preenchimento labial",
    "Uma harmonização facial de centavos", "O sósia do Ronaldinho Gaúcho", "Um dente perdido",
    "O fada do dente", "Um rato de esgoto", "O mestre Splinter", "As Tartarugas Ninja no bueiro",
    "Uma pizza de rodízio", "O garçom que não passa na sua mesa", "O suco de cevadinha",
    "Um copo de plástico que derrete", "O churrasco de domingo", "A maionese com batata",
    "O pavê ou pra cumê", "A piada do tio do pavê", "O fim de tarde no boteco",
    "Uma dose de 51", "O bafo de onça", "Uma onça pintada no quintal", "O lobo-guará",
    "Uma nota de 200 reais falsificada", "O coelhinho da Páscoa morto", "Um ovo de Páscoa de 100 reais",
    "A inflação", "O preço do tomate", "Um quilo de picanha", "O churrasqueiro raiz",
    "Uma cerveja artesanal de milho", "O hipster da Vila Madalena", "Um coque samurai",
    "Uma barba de lenhador", "O lenhador da barba de ouro", "Um machado de plástico",
    "O cosplay de Power Ranger", "O Power Ranger rosa ser homem", "Um segredo de infância",
    "O Tamagotchi morto", "Um Digivice", "O Pikachu chapado", "A Equipe Rocket",
    "Um plano infalível do Cebolinha", "O banho do Cascão", "A força da Mônica",
    "Um coelho de pelúcia com pedras dentro", "O Louco da turma da Mônica", "Um gibi mofado",
    "O cheiro de sebo", "Um sebo de livros", "O Paulo Coelho", "Um manual de autoajuda",
    "O Segredo", "A lei da atração", "Um imã de geladeira", "O gás acabou no meio do banho",
    "Uma ducha fria", "O chuveiro elétrico que dá choque", "A resistência queimada",
    "Um eletricista bêbado", "O Gambiarra", "Um cano estourado", "O ralo entupido com cabelos",
    "Uma peruca de nylon", "O Silvio Santos de peruca", "Um mergulho no Tietê",
    "A bactéria carnívora", "Um vírus chinês", "A máscara de pano suja", "O álcool em gel grudento",
    "Um negacionista", "O Zé Gotinha armado", "Uma vacina russa", "O chip do Bill Gates",
    "A 5G", "O sinal de fumaça", "Um pombo correio", "Uma cagada de pombo", "O rato com asas",
    "Um morcego no quarto", "O Batman de Osasco", "Uma coxinha de 1 real", "O caldo de cana",
    "Um pastel de vento", "A feira de domingo", "O grito do feirante", "A xepa",
    "Um tomate podre", "A cara de pau", "Um óleo de peroba", "O Pinóquio",
    "O nariz que cresce", "Uma mentira sincera", "O Cazuza", "Um show de rock",
    "O mosh que deu errado", "A queda do palco", "Um dente quebrado", "O implante dentário",
    "A próstata aumentada", "O exame de toque retal", "Um dedo no rastro", "O rastro de destruição",
    "O apocalipse", "A volta de Jesus", "O arrebatamento", "Ficar pra trás", "A marca da besta"
];

const rooms = {};

const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();
const generateSecret = () => Math.random().toString(36).substring(2, 15);

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // 1. CRIAR SALA (HOST)
    socket.on('create-room', (playerName = 'Host') => {
        const roomCode = generateCode();
        const hostSecret = generateSecret(); // Admin token

        rooms[roomCode] = {
            hostId: socket.id,
            hostSecret: hostSecret,
            players: [],
            state: 'LOBBY',
            deck: [...RESPOSTAS].sort(() => Math.random() - 0.5),
            currentJudgeIndex: 0,
            currentQuestion: "",
            tableCards: []
        };

        socket.join(roomCode);
        socket.emit('room-created', { roomCode, hostSecret });
        socket.emit('you-are-host');

        io.to(roomCode).emit('update-players', rooms[roomCode].players);
        console.log(`Sala ${roomCode} criada. Host: ${socket.id}`);
    });

    // 2. ENTRAR NA SALA (PLAYER)
    socket.on('join-room', ({ roomCode, playerName, avatar, hostSecret, fcmToken }) => {
        const room = rooms[roomCode];
        if (room) {

            // Verifica se é o Host (pelo ID ou pelo Secret)
            if (socket.id === room.hostId || (hostSecret && hostSecret === room.hostSecret)) {
                // Se for reconexão por Secret, atualiza o ID
                if (socket.id !== room.hostId) {
                    console.log(`Host reconectou com secret: ${socket.id}`);
                    room.hostId = socket.id;
                }

                console.log(`Host entrou no lobby: ${socket.id}`);
                // Não adiciona aos players
                socket.join(roomCode);
                socket.emit('joined-success', { playerId: socket.id });
                socket.emit('you-are-host');

                // Envia estado atual
                io.to(roomCode).emit('update-players', room.players);
                return;
            }

            const existingPlayer = room.players.find(p => p.name === playerName);

            if (existingPlayer) {
                console.log(`Reconexão: ${playerName}`);
                existingPlayer.id = socket.id;
                if (avatar) existingPlayer.avatar = avatar;
                if (fcmToken) existingPlayer.fcmToken = fcmToken; // Update Token

                socket.join(roomCode);

                socket.emit('joined-success', { playerId: socket.id });
                socket.emit('your-hand', existingPlayer.hand);

                if (room.state !== 'LOBBY') {
                    const judge = room.players[room.currentJudgeIndex];
                    socket.emit('round-start', {
                        question: room.currentQuestion,
                        judgeId: judge.id,
                        judgeName: judge.name
                    });
                    if (room.tableCards.length > 0) {
                        if (room.state === 'JUDGING') socket.emit('start-judging', room.tableCards);
                        else socket.emit('update-table', room.tableCards);
                    }
                }

                io.to(roomCode).emit('update-players', room.players);
                return;
            }

            if (room.state === 'LOBBY') {
                const player = {
                    id: socket.id,
                    name: playerName,
                    score: 0,
                    hand: [],
                    avatar: avatar || null,
                    fcmToken: fcmToken || null
                };
                room.players.push(player);
                socket.join(roomCode);

                io.to(roomCode).emit('update-players', room.players);
                socket.emit('joined-success', { playerId: socket.id });
            } else {
                socket.emit('error', 'Jogo já começou.');
            }
        } else {
            socket.emit('error', 'Sala não encontrada.');
        }
    });

    // Helper para iniciar rodada
    const startRound = (roomCode) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Se o deck estiver acabando, reembaralha (excluindo cartas nas mãos)
        if (room.deck.length < room.players.length * 5) {
            room.deck = [...RESPOSTAS].sort(() => Math.random() - 0.5);
        }

        room.tableCards = [];
        room.state = 'PLAYING';

        // Garante que o indice do juiz é válido
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
        if (!judge) return;

        io.to(roomCode).emit('round-start', {
            question: room.currentQuestion,
            judgeId: judge.id,
            judgeName: judge.name
        });

        room.players.forEach(player => {
            io.to(player.id).emit('your-hand', player.hand);
        });

        io.to(roomCode).emit('update-players', room.players);
    };

    // 3. INICIAR JOGO
    socket.on('start-game', ({ roomCode, settings }) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Permission Check: Host OR First Player
        const isHost = socket.id === room.hostId;
        const isFirstPlayer = room.players.length > 0 && socket.id === room.players[0].id;

        if (!isHost && !isFirstPlayer) {
            socket.emit('error', 'Apenas o Host ou o primeiro jogador podem iniciar.');
            return;
        }

        if (room.players.length < 3) {
            socket.emit('error', 'Mínimo de 3 jogadores para iniciar.');
            return;
        }

        // Save Settings
        // Default: { timer: 5, maxPoints: 10 }
        room.settings = {
            timer: settings?.timer || 5,
            maxPoints: settings?.maxPoints || 10
        };

        // Reset scores if new game
        room.players.forEach(p => p.score = 0);

        // Reset Judge Logic for fresh start
        room.currentJudgeIndex = -1; // Will become 0 in startRound logic (+1)

        startRound(roomCode);
    });

    // 4. JOGAR CARTA
    socket.on('play-card', ({ roomCode, cardText }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'PLAYING') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const judgeId = room.players[room.currentJudgeIndex].id;

        if (socket.id === judgeId) {
            socket.emit('error', 'O Juiz não joga cartas nesta fase!');
            return;
        }

        if (room.tableCards.find(c => c.playerId === socket.id)) return;

        player.hand = player.hand.filter(c => c !== cardText);
        room.tableCards.push({ playerId: socket.id, text: cardText, revealed: false });

        io.to(player.id).emit('your-hand', player.hand);
        io.to(roomCode).emit('card-played', room.tableCards.length);

        // Verifica se todos MENOS o juiz jogaram
        const playersToPlay = room.players.filter(p => p.id !== judgeId).length;

        if (room.tableCards.length >= playersToPlay) {
            room.state = 'JUDGING';
            room.tableCards.sort(() => Math.random() - 0.5);
            io.to(roomCode).emit('start-judging', room.tableCards);

            setTimeout(() => {
                io.to(roomCode).emit('update-table', room.tableCards);
            }, 500);
        }
    });

    // 5. REVELAR CARTA
    socket.on('reveal-card', ({ roomCode, index }) => {
        const room = rooms[roomCode];
        if (!room) return;

        const judgeId = room.players[room.currentJudgeIndex].id;
        if (socket.id !== judgeId) return;

        if (room.tableCards[index] && !room.tableCards[index].revealed) {
            room.tableCards[index].revealed = true;
            io.to(roomCode).emit('update-table', room.tableCards);
        }
    });

    // 6. ESCOLHER VENCEDOR
    socket.on('choose-winner', ({ roomCode, cardIndex }) => {
        const room = rooms[roomCode];
        if (!room) return;

        const winnerCard = room.tableCards[cardIndex];
        if (!winnerCard) return;

        const winner = room.players.find(p => p.id === winnerCard.playerId);

        if (winner) {
            winner.score += 1;
            room.state = 'RESULT';

            // CHECK MAX POINTS (GAME OVER)
            if (winner.score >= (room.settings?.maxPoints || 10)) {
                io.to(roomCode).emit('game-ended', {
                    winnerName: winner.name,
                    scores: room.players
                });
                room.state = 'LOBBY'; // Reset state (but keep players/room)
                return;
            }

            // ROUND WINNER & NEXT ROUND TIMER
            const nextRoundIn = room.settings?.timer || 5;

            io.to(roomCode).emit('round-winner', {
                winnerName: winner.name,
                winningCard: winnerCard.text,
                scores: room.players,
                nextRoundIn: nextRoundIn
            });

            // Auto-start next round
            console.log(`Round ended. Next round in ${nextRoundIn} seconds.`);
            setTimeout(() => {
                const currentRoom = rooms[roomCode];
                // Check if room still exists and state is still RESULT (prevent validation race conditions)
                if (currentRoom && currentRoom.state === 'RESULT') {
                    console.log(`Starting next round for room ${roomCode}`);
                    startRound(roomCode);
                } else {
                    console.log(`Cannot start next round. Room State: ${currentRoom ? currentRoom.state : 'Deleted'}`);
                }
            }, nextRoundIn * 1000);
        }
    });

    // 7. ENVIAR NOTIFICAÇÃO (HOST -> PLAYERS)
    socket.on('send-notification', ({ roomCode, message }) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Verify Host
        if (socket.id !== room.hostId) return;

        // 1. Emit via socket (for foreground/web)
        io.to(roomCode).emit('notification', { message });

        // 2. Send Push Notification (FCM Topic)
        if (admin.apps.length > 0) {
            const topic = `room_${roomCode}`;
            console.log(`Sending Push Notification to Topic: ${topic}`);

            admin.messaging().send({
                topic: topic,
                notification: {
                    title: 'Aviso do Host',
                    body: message
                }
            })
                .then((response) => {
                    console.log('FCM Topic Success:', response);
                })
                .catch((error) => {
                    console.log('FCM Topic Error:', error);
                });
        } else {
            console.log("FCM Skipped: Admin not initialized.");
        }
    });

    // TRATAMENTO DE DESCONEXÃO MAIS ROBUSTO
    socket.on('disconnect', () => {
        console.log('Desconectado:', socket.id);

        Object.keys(rooms).forEach(code => {
            const room = rooms[code];
            // Procura pelo ID EXATO que desconectou
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            // Se não achou, pode ser que o usuário já tenha reconectado (ID mudou), então ignoramos
            if (playerIndex === -1) return;

            // Se achou, remove o jogador (realmente caiu)
            const player = room.players[playerIndex];
            console.log(`Jogador saiu definitivamente: ${player.name}`);

            room.players.splice(playerIndex, 1);

            // Ajusta o ponteiro do Juiz se necessário (se quem saiu estava antes do juiz na lista)
            if (playerIndex < room.currentJudgeIndex) {
                room.currentJudgeIndex--;
            }

            io.to(code).emit('update-players', room.players);

            if (room.players.length === 0) {
                delete rooms[code];
                return;
            }

            // LÓGICA DE CONTINUIDADE (Se o jogo estava rolando)
            if (room.state === 'PLAYING' || room.state === 'JUDGING') {
                // Verifica continuidade do jogo
                const playersToPlay = Math.max(0, room.players.length - 1); // -1 do juiz

                if (playersToPlay === 0) {
                    // Só sobrou 1 jogador (o juiz, ou nem isso)
                    room.state = 'LOBBY';
                    io.to(code).emit('error', 'Jogadores insuficientes. Voltando ao Lobby.');
                    return;
                }

                // Ajuste de segurança para o ponteiro do juiz
                if (room.currentJudgeIndex >= room.players.length) {
                    room.currentJudgeIndex = 0;
                }

                // Se estamos no meio da rodada, verificamos se a saída da pessoa permite avançar
                // (Ex: Só faltava ela jogar)

                const currentJudge = room.players[room.currentJudgeIndex];
                if (!currentJudge) return;

                const judgeId = currentJudge.id;

                // Remove cartas jogadas por quem saiu para não "sujar" a mesa
                room.tableCards = room.tableCards.filter(c => c.playerId !== socket.id);

                const playedCount = room.tableCards.length;
                const needed = room.players.filter(p => p.id !== judgeId).length;

                // Se já jugaram todos que sobraram
                if (playedCount >= needed && needed > 0 && room.state === 'PLAYING') {
                    room.state = 'JUDGING';
                    room.tableCards.sort(() => Math.random() - 0.5);
                    io.to(code).emit('start-judging', room.tableCards);
                }
            }
        });
    });
});

// Adicione '0.0.0.0' para liberar acesso externo/emulador
server.listen(3000, '0.0.0.0', () => {

    
    
    
    
    console.log('SERVER RODANDO NA PORTA 3000 (Aberto para rede)');
});
