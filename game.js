document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    let gameState = {};

    // --- DADOS EXPANDIDOS DO JOGO ---
    const clans = {
        'Uchiha': {
            description: "Herdeiros do Sharingan, um doujutsu despertado por trauma ou emoções extremas. Permite copiar jutsus, prever movimentos e lançar genjutsus poderosos.",
            powers: { sharingan: { unlocked: false, tomoe: 0 } }
        },
        'Hyuga': {
            description: "Mestres do Byakugan, que lhes concede visão de 360° e a capacidade de ver o sistema de chakra. Seu estilo de luta, o Punho Gentil, ataca diretamente os órgãos internos do oponente.",
            powers: { byakugan: { unlocked: false, mastery: 0 } }
        },
        'Nara': {
            description: "Gênios estratégicos com QI altíssimo. Manipulam suas sombras para prender e controlar oponentes com o Jutsu de Imitação pela Sombra. O poder é aprimorado com a inteligência.",
            powers: { shadowJutsu: { unlocked: false, duration: 5 } } // Duração em "turnos" ou segundos
        },
        'Akimichi': {
            description: "Especialistas no Jutsu de Expansão, convertendo calorias em chakra para aumentar o tamanho e a força de seus corpos. São motivados pela lealdade e proteção de seus companheiros.",
            powers: { expansionJutsu: { unlocked: false, level: 0 } }
        },
        'Inuzuka': {
            description: "Lutam em perfeita sintonia com seus parceiros caninos (ninken). Possuem sentidos aguçados e usam jutsus de colaboração bestial. O laço com seu cão é a fonte de seu poder.",
            powers: { ninkenBond: { level: 1 } }
        },
        'Aburame': {
            description: "Um clã misterioso que forma uma simbiose com uma raça especial de insetos sugadores de chakra, os kikaichū. Os insetos vivem em seus corpos e podem ser usados para ataque, defesa e espionagem.",
            powers: { kikaichu: { unlocked: true, population: 1000 } }
        },
        'Sarutobi': {
            description: "Conhecidos por sua força de vontade e maestria em uma vasta gama de jutsus, especialmente afinidade com o Estilo Fogo. O progresso vem do treino árduo e da determinação.",
            powers: { fireAffinity: { level: 1 } }
        },
        'Sem Clã': {
            description: "Você não possui uma linhagem famosa, mas seu potencial é ilimitado. Sua força virá do seu próprio suor, criatividade e da forja de seu próprio caminho ninja.",
            powers: {}
        }
    };

    const villages = ['Konohagakure (Folha)', 'Sunagakure (Areia)', 'Kirigakure (Névoa)', 'Iwagakure (Pedra)', 'Kumogakure (Nuvem)'];

    // --- FUNÇÕES PRINCIPAIS DO JOGO (Sem alterações, exceto por melhorias internas) ---

    function showMainMenu() {
        gameContainer.innerHTML = `
            <h1 class="hud-title">Naruto RPG: O Conto do Shinobi</h1>
            <div class="story-text" style="text-align: center;">
                <p>Bem-vindo ao mundo de Naruto. Crie seu shinobi e forje sua própria lenda.</p>
                <br>
                <label for="difficulty">Dificuldade:</label>
                <select id="difficulty">
                    <option value="genin">Genin (Fácil)</option>
                    <option value="chunin">Chunin (Normal)</option>
                    <option value="jounin">Jounin (Difícil)</option>
                </select>
            </div>
            <div class="choices">
                <button class="btn" id="new-game">Novo Jogo</button>
                <button class="btn" id="load-game">Carregar Jogo</button>
            </div>
        `;
        document.getElementById('new-game').addEventListener('click', startNewGame);
        document.getElementById('load-game').addEventListener('click', loadGame);
    }

    function startNewGame() {
        const difficulty = document.getElementById('difficulty').value;
        gameState = {
            player: {
                name: '', clan: '', village: '',
                stats: { taijutsu: 1, ninjutsu: 1, genjutsu: 1, intelligence: 1, speed: 1 },
                jutsu: ["Jutsu de Substituição", "Jutsu de Transformação"],
                clanPowers: {}
            },
            team: {
                rival: "Kaito",
                friend: "Rina"
            },
            difficulty: difficulty,
            currentStoryNode: 'intro'
        };
        renderStoryNode('intro');
    }

    function saveGame() {
        if (Object.keys(gameState).length === 0) {
            alert("Não há jogo para salvar!"); return;
        }
        localStorage.setItem('narutoRPGSave', JSON.stringify(gameState));
        alert("Jogo Salvo!");
    }

    function loadGame() {
        const savedGame = localStorage.getItem('narutoRPGSave');
        if (savedGame) {
            gameState = JSON.parse(savedGame);
            alert("Jogo Carregado!");
            renderStoryNode(gameState.currentStoryNode);
        } else {
            alert("Nenhum jogo salvo encontrado.");
        }
    }

    function showCharCreation() {
        gameContainer.innerHTML = `
            <h2 class="hud-title">Criação de Personagem</h2>
            <div class="story-text">
                <label for="char-name">Seu Nome:</label>
                <input type="text" id="char-name" placeholder="Digite seu nome ninja...">
                <label for="char-clan">Seu Clã:</label>
                <select id="char-clan">
                    ${Object.keys(clans).map(clan => `<option value="${clan}">${clan}</option>`).join('')}
                </select>
                <p id="clan-description">${clans['Uchiha'].description}</p>
                <label for="char-village">Sua Aldeia:</label>
                <select id="char-village">
                    ${villages.map(village => `<option value="${village}">${village}</option>`).join('')}
                </select>
            </div>
            <div class="choices">
                <button class="btn" id="start-journey">Iniciar Jornada</button>
            </div>
        `;
        const clanSelect = document.getElementById('char-clan');
        const clanDesc = document.getElementById('clan-description');
        clanSelect.addEventListener('change', () => { clanDesc.textContent = clans[clanSelect.value].description; });
        document.getElementById('start-journey').addEventListener('click', () => {
            const name = document.getElementById('char-name').value;
            if (!name) { alert("Por favor, digite um nome."); return; }
            gameState.player.name = name;
            gameState.player.clan = document.getElementById('char-clan').value;
            gameState.player.village = document.getElementById('char-village').value;
            gameState.player.clanPowers = JSON.parse(JSON.stringify(clans[gameState.player.clan].powers));
            gameState.currentStoryNode = 'academy_start';
            renderStoryNode('academy_start');
        });
    }

    function renderStoryNode(nodeId) {
        const node = storyNodes[nodeId];
        if (!node) { console.error(`Nó da história não encontrado: ${nodeId}`); return; }
        gameState.currentStoryNode = nodeId;
        
        let processedText = node.text
            .replace(/\[playerName\]/g, gameState.player.name)
            .replace(/\[clanName\]/g, gameState.player.clan)
            .replace(/\[rivalName\]/g, gameState.team.rival)
            .replace(/\[friendName\]/g, gameState.team.friend);

        gameContainer.innerHTML = `
            <div class="story-text">${processedText}</div>
            <div class="choices">
                ${node.choices.map((choice, index) => {
                    if (choice.condition && !choice.condition(gameState)) return '';
                    return `<button class="btn choice-btn" data-index="${index}">${choice.text}</button>`;
                }).join('')}
                <button class="btn" id="save-btn">Salvar Jogo</button>
            </div>
        `;
        document.querySelectorAll('.choice-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const choice = node.choices[e.target.getAttribute('data-index')];
                if (choice.action) choice.action(gameState);
                renderStoryNode(choice.next);
            });
        });
        document.getElementById('save-btn').addEventListener('click', saveGame);
    }

    // --- ARCO 1 DA HISTÓRIA: DO TESTE DOS SINOS À PRIMEIRA MISSÃO ---
    const storyNodes = {
        'intro': {
            text: `Uma década se passou desde a Quarta Grande Guerra Ninja. A paz reina, mas novas ameaças se agitam nas sombras. Uma nova geração de ninjas, incluindo você, deve se erguer para proteger o mundo. Sua história começa agora...`,
            choices: [{ text: "Iniciar minha lenda...", next: 'char_creation_start' }]
        },
        'char_creation_start': {
            text: `É hora de definir quem você é neste mundo.`,
            choices: [],
            action: (gs) => showCharCreation(),
            next: null
        },
        'academy_start': {
            text: `Você é [playerName], um recém-formado da Academia Ninja de [village]. Você foi designado para o Time 7, junto com [rivalName], um ninja talentoso e um tanto arrogante, e [friendName], uma kunoichi inteligente e cautelosa. \n\nSeu novo Jounin-sensei, um ninja experiente chamado Hayate, os leva para o campo de treinamento. \n\n"Seu teste final para se tornarem Genin de verdade começa agora," diz Hayate, mostrando dois sinos presos à sua cintura. "Vocês têm até o meio-dia para pegar um destes sinos. Quem não conseguir, volta para a academia. E ah, só tem dois sinos."`,
            choices: [
                { text: "Atacar Hayate de frente com tudo que tenho.", next: 'bell_test_direct', action: gs => gs.player.stats.taijutsu++ },
                { text: "Procurar [rivalName] e [friendName] para fazer um plano.", next: 'bell_test_teamwork', action: gs => gs.player.stats.intelligence++ },
                { text: "Esconder-me e observar os movimentos do sensei.", next: 'bell_test_observe' }
            ]
        },
        'bell_test_direct': {
            text: `Você avança com coragem, mas Hayate desvia de todos os seus ataques com uma facilidade desconcertante. Com um movimento rápido, ele te prende em uma armadilha de cordas. \n\n"Força bruta não é tudo, [playerName]," ele diz. "Você precisa pensar."`,
            choices: [{ text: "Esperar, preso na armadilha.", next: 'bell_test_after_fail' }]
        },
        'bell_test_observe': {
            text: `Você se oculta nas árvores, analisando os padrões de Hayate. Você percebe que ele nunca tira os olhos do livro que está lendo, mesmo lutando. É uma distração. Você nota [rivalName] atacando de forma imprudente e sendo derrotado, e [friendName] caindo em um genjutsu simples. Eles não conseguirão sozinhos.`,
            choices: [{ text: "Ir ajudá-los e propor um plano.", next: 'bell_test_teamwork' }]
        },
        'bell_test_teamwork': {
            text: `Você encontra seus companheiros. [rivalName] está frustrado e [friendName] está assustada. Você os convence de que a única forma de vencer é trabalhando juntos. \n\nO plano: você e [rivalName] criarão uma distração, enquanto [friendName] usa sua perícia para tentar pegar os sinos.`,
            choices: [{ text: "Executar o plano!", next: 'bell_test_climax' }]
        },
        'bell_test_after_fail': {
            text: `Depois de um tempo, [friendName] te encontra e te liberta da armadilha. Ela te conta que [rivalName] também foi derrotado. "Acho que precisamos trabalhar juntos," ela diz.`,
            choices: [{ text: "Concordar e procurar [rivalName].", next: 'bell_test_teamwork' }]
        },
        'bell_test_climax': {
            text: `A distração funciona! Hayate é forçado a focar em você e [rivalName]. No momento crucial, [friendName] quase consegue pegar os sinos, mas Hayate a impede no último segundo. \n\nO tempo acaba. Vocês falharam em pegar os sinos.`,
            choices: [{ text: "Aceitar o fracasso.", next: 'bell_test_result' }]
        },
        'bell_test_result': {
            text: `Hayate reúne vocês. "Vocês falharam na missão," ele diz, sério. "Mas... vocês passaram no teste." \n\nEle explica que o verdadeiro objetivo era testar o trabalho em equipe. Por colocarem os companheiros acima da missão, vocês provaram que são verdadeiros ninjas. \n\n"Bem-vindos ao Time 7. Nossa jornada começa agora."`,
            choices: [{ text: "Nossa primeira missão!", next: 'mission_briefing' }]
        },
        'mission_briefing': {
            text: `Semanas depois, após várias missões Rank-D (pegar gatos, capinar jardins...), vocês recebem sua primeira missão Rank-C de verdade: escoltar um construtor de pontes, chamado Tazuna, de volta à sua casa no País das Ondas.`,
            choices: [{ text: "Partir para o País das Ondas.", next: 'mission_ambush' }]
        },
        'mission_ambush': {
            text: `Na estrada, vocês são subitamente emboscados por dois ninjas da Névoa. Eles derrotam Hayate-sensei rapidamente, que se revela ser um clone. Os ninjas avançam na direção de Tazuna!`,
            choices: [
                { text: "Proteger Tazuna e lutar!", next: 'mission_fight_demon_bros' },
                { text: "[Hyuga] Usar o Byakugan para analisar o inimigo.", next: 'mission_fight_hyuga', condition: gs => gs.player.clan === 'Hyuga' },
                { text: "[Inuzuka] Deixar meu ninken rastrear o perigo!", next: 'mission_fight_inuzuka', condition: gs => gs.player.clan === 'Inuzuka' },
                { text: "[Nara] Tentar prender um deles com minha sombra.", next: 'mission_fight_nara', condition: gs => gs.player.clan === 'Nara' }
            ]
        },
        // -- INÍCIO DOS DESBLOQUEIOS NARRATIVOS --
        'mission_fight_demon_bros': {
            text: `Você e seus companheiros lutam bravamente, mas os ninjas inimigos são experientes. Um deles está prestes a acertar [friendName] pelas costas. O medo e a adrenalina tomam conta de você.`,
            choices: [
                { text: "Empurrá-la para fora do caminho!", next: 'mission_resolve' },
                // AQUI O DESBLOQUEIO UCHIHA ACONTECE
                { 
                    text: "[Uchiha] SENTIR UM PODER DESPERTAR EM MEUS OLHOS!", 
                    next: 'uchiha_awakening', 
                    condition: gs => gs.player.clan === 'Uchiha' && !gs.player.clanPowers.sharingan.unlocked 
                }
            ]
        },
        'uchiha_awakening': {
            text: `No momento de pânico, uma dor aguda percorre seus olhos. O mundo ao seu redor parece se mover em câmera lenta. Você vê o ataque do ninja com uma clareza incrível. \n\nSem pensar, você se move, intercepta o ataque e contra-ataca. O ninja recua, surpreso. Você se olha em uma poça d'água e vê: o Sharingan de um tomoe refletido em seus olhos.`,
            action: gs => { gs.player.clanPowers.sharingan.unlocked = true; gs.player.clanPowers.sharingan.tomoe = 1; gs.player.stats.ninjutsu += 2; },
            choices: [{ text: "Usar este novo poder para virar o jogo.", next: 'mission_resolve' }]
        },
        'mission_fight_hyuga': {
            text: `Você ativa seu Byakugan! A visão de 360 graus revela o segundo ninja se escondendo para um ataque surpresa. Você alerta a todos, frustrando a emboscada. \n\nO treino intenso valeu a pena. Você sente seu controle sobre o doujutsu se aprofundar.`,
            action: gs => { gs.player.clanPowers.byakugan.unlocked = true; gs.player.clanPowers.byakugan.mastery++; },
            choices: [{ text: "Coordenar o contra-ataque.", next: 'mission_resolve' }]
        },
        'mission_fight_inuzuka': {
            text: `Seu parceiro canino late furiosamente, detectando o perigo antes de todos. Ele salta e intercepta um dos ninjas, mordendo seu braço e mostrando uma ferocidade que você nunca viu. Seu laço se fortaleceu no calor da batalha.`,
            action: gs => { gs.player.clanPowers.ninkenBond.level++; gs.player.jutsu.push("Presa Sobre Presa"); },
            choices: [{ text: "Lutar junto com meu parceiro!", next: 'mission_resolve' }]
        },
        'mission_fight_nara': {
            text: `Enquanto todos estão distraídos, você calcula o ângulo do sol e estende sua sombra. Ela se conecta perfeitamente com a de um dos inimigos, paralisando-o. "Jutsu de Imitação pela Sombra... completo."`,
            action: gs => { gs.player.clanPowers.shadowJutsu.unlocked = true; gs.player.stats.intelligence += 2; },
            choices: [{ text: "Deixar que a equipe cuide do outro.", next: 'mission_resolve' }]
        },
        'mission_resolve': {
            text: `Com seu ato decisivo, o time consegue virar a maré e derrotar os ninjas da Névoa. O verdadeiro Hayate-sensei aparece, elogiando sua coragem e habilidade. \n\nTazuna, assustado, finalmente confessa: ele é alvo de um magnata corrupto chamado Gatô e seu assassino pessoal, um ninja perigosíssimo. A missão é, na verdade, Rank-A.`,
            choices: [
                { text: "Continuar a missão. Não abandonamos nossos clientes!", next: 'mission_final_confrontation', action: gs => gs.player.stats.taijutsu++ },
                { text: "Voltar para a aldeia. Isso está além de nós.", next: 'mission_failed' }
            ]
        },
        'mission_failed': {
            text: `Vocês retornam à aldeia. O Hokage entende sua decisão, mas uma sombra de decepção paira no ar. A jornada de vocês será mais longa e árdua. \n\nFIM DO ARCO 1.`,
            choices: []
        },
        'mission_final_confrontation': {
            text: `Vocês chegam ao País das Ondas e, após alguns dias, o assassino de Gatô aparece na ponte inacabada: Zabuza Momochi, o Demônio da Névoa Oculta, um dos Sete Espadachins da Névoa. Sua presença é aterrorizante. \n\nHayate-sensei o enfrenta, mas fica preso no Jutsu Prisão de Água de Zabuza. "Corram! Levem o cliente!", ele grita.`,
            choices: [
                { text: "Fugir é impensável! Vamos libertar nosso sensei!", next: 'zabuza_fight' },
                { 
                    text: "[Akimichi] EU VOU ESMAGÁ-LO PARA PROTEGER MEUS AMIGOS!", 
                    next: 'akimi_awakening',
                    condition: gs => gs.player.clan === 'Akimichi' && !gs.player.clanPowers.expansionJutsu.unlocked
                }
            ]
        },
        'akimi_awakening': {
            text: `Vendo seu sensei e amigos em perigo mortal, uma fúria protetora explode dentro de você. Você realiza os selos de mão instintivamente, convertendo toda sua energia em poder. \n\nSeu corpo se expande, transformando-se em uma bola de demolição humana! "JUTSU TANQUE DE CARNE HUMANA!"`,
            action: gs => { gs.player.clanPowers.expansionJutsu.unlocked = true; gs.player.clanPowers.expansionJutsu.level++; gs.player.jutsu.push("Jutsu de Expansão Parcial"); },
            choices: [{ text: "Rolar em direção a Zabuza!", next: 'zabuza_fight' }]
        },
        'zabuza_fight': {
            text: `Trabalhando juntos, com uma estratégia brilhante bolada por você e [friendName], vocês conseguem forçar Zabuza a liberar Hayate. A batalha é feroz. \n\nNo fim, exaustos, vocês conseguem derrotar o Demônio da Névoa. Vocês não são mais apenas crianças. Vocês são ninjas de verdade.`,
            choices: [{ text: "Retornar como heróis.", next: 'mission_epilogue' }]
        },
        'mission_epilogue': {
            text: `Vocês retornam para Konoha. A notícia de sua vitória contra Zabuza se espalha. Vocês são reconhecidos pelo Hokage e por toda a aldeia. \n\nHayate-sensei reúne o time. "Estou orgulhoso de vocês," ele diz. "Eu os indiquei para os Exames Chunin."`,
            choices: [{ text: "O Fim do Começo. (Fim do Arco 1)", next: 'to_be_continued' }]
        },
        'to_be_continued': {
            text: "Sua jornada como shinobi está apenas começando. Os Exames Chunin o aguardam, com novos rivais, desafios mortais e poderes ainda maiores a serem despertados. \n\nObrigado por jogar! Para continuar, adicione mais nós de história ao arquivo game.js.",
            choices: []
        }
    };

    // Iniciar o jogo
    showMainMenu();
});