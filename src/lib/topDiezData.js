export function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const CATEGORIAS = [
  {
    id: 'laliga_2026', titulo: 'Goleadores LaLiga 2025/26', pista: 'equipo',
    top10: [
      { nombre: 'Kylian Mbappé', pista: 'Real Madrid' },
      { nombre: 'Vedat Muriqi', pista: 'Mallorca' },
      { nombre: 'Ante Budimir', pista: 'Osasuna' },
      { nombre: 'Lamine Yamal', pista: 'FC Barcelona' },
      { nombre: 'Ferran Torres', pista: 'FC Barcelona' },
      { nombre: 'Vinicius Jr', pista: 'Real Madrid' },
      { nombre: 'Mikel Oyarzabal', pista: 'Real Sociedad' },
      { nombre: 'Robert Lewandowski', pista: 'FC Barcelona' },
      { nombre: 'Borja Iglesias', pista: 'Celta' },
      { nombre: 'Toni Martínez', pista: 'Deportivo Alavés' },
    ]
  },
  {
    id: 'laliga_2025', titulo: 'Goleadores LaLiga 2024/25', pista: 'equipo',
    top10: [
      { nombre: 'Kylian Mbappé', pista: 'Real Madrid' },
      { nombre: 'Robert Lewandowski', pista: 'FC Barcelona' },
      { nombre: 'Ante Budimir', pista: 'Osasuna' },
      { nombre: 'Alexander Sørloth', pista: 'Atlético de Madrid' },
      { nombre: 'Ayoze Pérez', pista: 'Villarreal' },
      { nombre: 'Raphinha', pista: 'FC Barcelona' },
      { nombre: 'Julián Álvarez', pista: 'Atlético de Madrid' },
      { nombre: 'Oihan Sancet', pista: 'Athletic Club' },
      { nombre: 'Kike García', pista: 'Deportivo Alavés' },
      { nombre: 'Javi Puado', pista: 'Espanyol' },
    ]
  },
  {
    id: 'laliga_2024', titulo: 'Goleadores LaLiga 2023/24', pista: 'equipo',
    top10: [
      { nombre: 'Artem Dovbyk', pista: 'Girona FC' },
      { nombre: 'Alexander Sørloth', pista: 'Villarreal' },
      { nombre: 'Jude Bellingham', pista: 'Real Madrid' },
      { nombre: 'Robert Lewandowski', pista: 'FC Barcelona' },
      { nombre: 'Ante Budimir', pista: 'Osasuna' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Youssef En-Nesyri', pista: 'Sevilla' },
      { nombre: 'Vinicius Jr', pista: 'Real Madrid' },
      { nombre: 'Borja Mayoral', pista: 'Getafe' },
      { nombre: 'Álvaro Morata', pista: 'Atlético de Madrid' },
    ]
  },
  {
    id: 'laliga_2023', titulo: 'Goleadores LaLiga 2022/23', pista: 'equipo',
    top10: [
      { nombre: 'Robert Lewandowski', pista: 'FC Barcelona' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Joselu', pista: 'Espanyol' },
      { nombre: 'Borja Iglesias', pista: 'Real Betis' },
      { nombre: 'Vedat Muriqi', pista: 'Mallorca' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Enes Ünal', pista: 'Getafe' },
      { nombre: 'Taty Castellanos', pista: 'Girona FC' },
      { nombre: 'Álvaro Morata', pista: 'Atlético de Madrid' },
      { nombre: 'Nicolas Jackson', pista: 'Villarreal' },
    ]
  },
  {
    id: 'laliga_2022', titulo: 'Goleadores LaLiga 2021/22', pista: 'equipo',
    top10: [
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Raúl De Tomás', pista: 'Espanyol' },
      { nombre: 'Vinicius Jr', pista: 'Real Madrid' },
      { nombre: 'Iago Aspas', pista: 'Celta' },
      { nombre: 'Juanmi', pista: 'Real Betis' },
      { nombre: 'Enes Ünal', pista: 'Getafe' },
      { nombre: 'Joselu', pista: 'Deportivo Alavés' },
      { nombre: 'Morales', pista: 'Levante' },
      { nombre: 'Memphis Depay', pista: 'FC Barcelona' },
      { nombre: 'Ángel Correa', pista: 'Atlético de Madrid' },
    ]
  },
  {
    id: 'laliga_2021', titulo: 'Goleadores LaLiga 2020/21', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Gerard Moreno', pista: 'Villarreal' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Luis Suárez', pista: 'Atlético de Madrid' },
      { nombre: 'Youssef En-Nesyri', pista: 'Sevilla' },
      { nombre: 'Alexander Isak', pista: 'Real Sociedad' },
      { nombre: 'Iago Aspas', pista: 'Celta' },
      { nombre: 'Antoine Griezmann', pista: 'FC Barcelona' },
      { nombre: 'Morales', pista: 'Levante' },
      { nombre: 'Rafa Mir', pista: 'Huesca' },
    ]
  },
  {
    id: 'laliga_2020', titulo: 'Goleadores LaLiga 2019/20', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Gerard Moreno', pista: 'Villarreal' },
      { nombre: 'Luis Suárez', pista: 'FC Barcelona' },
      { nombre: 'Raúl García', pista: 'Athletic Club' },
      { nombre: 'Lucas Ocampos', pista: 'Sevilla' },
      { nombre: 'Iago Aspas', pista: 'Celta' },
      { nombre: 'Ante Budimir', pista: 'Mallorca' },
      { nombre: 'Álvaro Morata', pista: 'Atlético de Madrid' },
      { nombre: 'Lucas Pérez', pista: 'Deportivo Alavés' },
    ]
  },
  {
    id: 'laliga_2019', titulo: 'Goleadores LaLiga 2018/19', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Luis Suárez', pista: 'FC Barcelona' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Iago Aspas', pista: 'Celta' },
      { nombre: 'Cristhian Stuani', pista: 'Girona FC' },
      { nombre: 'Wissam Ben Yedder', pista: 'Sevilla' },
      { nombre: 'Borja Iglesias', pista: 'Espanyol' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Raúl De Tomás', pista: 'Rayo Vallecano' },
      { nombre: 'Charles', pista: 'Eibar' },
    ]
  },
  {
    id: 'laliga_2018', titulo: 'Goleadores LaLiga 2017/18', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Luis Suárez', pista: 'FC Barcelona' },
      { nombre: 'Iago Aspas', pista: 'Celta' },
      { nombre: 'Cristhian Stuani', pista: 'Girona FC' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Maxi Gómez', pista: 'Celta' },
      { nombre: 'Gareth Bale', pista: 'Real Madrid' },
      { nombre: 'Rodrigo Moreno', pista: 'Valencia' },
      { nombre: 'Gerard Moreno', pista: 'Espanyol' },
    ]
  },
  {
    id: 'laliga_2017', titulo: 'Goleadores LaLiga 2016/17', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Luis Suárez', pista: 'FC Barcelona' },
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Iago Aspas', pista: 'Celta' },
      { nombre: 'Aritz Aduriz', pista: 'Athletic Club' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Álvaro Morata', pista: 'Real Madrid' },
      { nombre: 'Sandro Ramírez', pista: 'Málaga' },
      { nombre: 'Neymar', pista: 'FC Barcelona' },
      { nombre: 'Rubén Castro', pista: 'Real Betis' },
    ]
  },
  {
    id: 'laliga_2016', titulo: 'Goleadores LaLiga 2015/16', pista: 'equipo',
    top10: [
      { nombre: 'Luis Suárez', pista: 'FC Barcelona' },
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Neymar', pista: 'FC Barcelona' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Aritz Aduriz', pista: 'Athletic Club' },
      { nombre: 'Gareth Bale', pista: 'Real Madrid' },
      { nombre: 'Rubén Castro', pista: 'Real Betis' },
      { nombre: 'Borja Bastón', pista: 'Eibar' },
    ]
  },
  {
    id: 'laliga_2015', titulo: 'Goleadores LaLiga 2014/15', pista: 'equipo',
    top10: [
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Neymar', pista: 'FC Barcelona' },
      { nombre: 'Antoine Griezmann', pista: 'Atlético de Madrid' },
      { nombre: 'Carlos Bacca', pista: 'Sevilla' },
      { nombre: 'Aritz Aduriz', pista: 'Athletic Club' },
      { nombre: 'Bueno', pista: 'Rayo Vallecano' },
      { nombre: 'Luis Suárez', pista: 'FC Barcelona' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Jonathas', pista: 'Elche' },
    ]
  },
  {
    id: 'laliga_2014', titulo: 'Goleadores LaLiga 2013/14', pista: 'equipo',
    top10: [
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Diego Costa', pista: 'Atlético de Madrid' },
      { nombre: 'Alexis Sánchez', pista: 'FC Barcelona' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Antoine Griezmann', pista: 'Real Sociedad' },
      { nombre: 'Aritz Aduriz', pista: 'Athletic Club' },
      { nombre: 'Carlos Vela', pista: 'Real Sociedad' },
      { nombre: 'Gareth Bale', pista: 'Real Madrid' },
      { nombre: 'Kévin Gameiro', pista: 'Sevilla' },
    ]
  },
  {
    id: 'laliga_2013', titulo: 'Goleadores LaLiga 2012/13', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Radamel Falcao', pista: 'Atlético de Madrid' },
      { nombre: 'Álvaro Negredo', pista: 'Sevilla' },
      { nombre: 'Roberto Soldado', pista: 'Valencia' },
      { nombre: 'Rubén Castro', pista: 'Real Betis' },
      { nombre: 'Piti', pista: 'Rayo Vallecano' },
      { nombre: 'Gonzalo Higuaín', pista: 'Real Madrid' },
      { nombre: 'Imanol Agirretxe', pista: 'Real Sociedad' },
      { nombre: 'Carlos Vela', pista: 'Real Sociedad' },
    ]
  },
  {
    id: 'laliga_2012', titulo: 'Goleadores LaLiga 2011/12', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Radamel Falcao', pista: 'Atlético de Madrid' },
      { nombre: 'Gonzalo Higuaín', pista: 'Real Madrid' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Roberto Soldado', pista: 'Valencia' },
      { nombre: 'Fernando Llorente', pista: 'Athletic Club' },
      { nombre: 'Rubén Castro', pista: 'Real Betis' },
      { nombre: 'Arouna Koné', pista: 'Levante' },
      { nombre: 'Michu', pista: 'Rayo Vallecano' },
    ]
  },
  {
    id: 'laliga_2011', titulo: 'Goleadores LaLiga 2010/11', pista: 'equipo',
    top10: [
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Sergio Agüero', pista: 'Atlético de Madrid' },
      { nombre: 'Álvaro Negredo', pista: 'Sevilla' },
      { nombre: 'David Villa', pista: 'FC Barcelona' },
      { nombre: 'Roberto Soldado', pista: 'Valencia' },
      { nombre: 'Giuseppe Rossi', pista: 'Villarreal' },
      { nombre: 'Fernando Llorente', pista: 'Athletic Club' },
      { nombre: 'Karim Benzema', pista: 'Real Madrid' },
      { nombre: 'Salomón Rondón', pista: 'Málaga' },
    ]
  },
  {
    id: 'laliga_2010', titulo: 'Goleadores LaLiga 2009/10', pista: 'equipo',
    top10: [
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Gonzalo Higuaín', pista: 'Real Madrid' },
      { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
      { nombre: 'David Villa', pista: 'Valencia' },
      { nombre: 'Diego Forlán', pista: 'Atlético de Madrid' },
      { nombre: 'Roberto Soldado', pista: 'Getafe' },
      { nombre: 'Zlatan Ibrahimović', pista: 'FC Barcelona' },
      { nombre: 'Luis Fabiano', pista: 'Sevilla' },
      { nombre: 'Fernando Llorente', pista: 'Athletic Club' },
      { nombre: 'Nino', pista: 'Tenerife' },
    ]
  },
  {
    id: 'laliga_2009', titulo: 'Goleadores LaLiga 2008/09', pista: 'equipo',
    top10: [
      { nombre: 'Diego Forlán', pista: 'Atlético de Madrid' },
      { nombre: 'Samuel Eto\'o', pista: 'FC Barcelona' },
      { nombre: 'David Villa', pista: 'Valencia' },
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Gonzalo Higuaín', pista: 'Real Madrid' },
      { nombre: 'Thierry Henry', pista: 'FC Barcelona' },
      { nombre: 'Álvaro Negredo', pista: 'Almería' },
      { nombre: 'Frédéric Kanouté', pista: 'Sevilla' },
      { nombre: 'Raúl', pista: 'Real Madrid' },
      { nombre: 'Sergio Agüero', pista: 'Atlético de Madrid' },
    ]
  },
  {
    id: 'laliga_2008', titulo: 'Goleadores LaLiga 2007/08', pista: 'equipo',
    top10: [
      { nombre: 'Daniel Güiza', pista: 'Mallorca' },
      { nombre: 'Luis Fabiano', pista: 'Sevilla' },
      { nombre: 'David Villa', pista: 'Valencia' },
      { nombre: 'Nihat', pista: 'Villarreal' },
      { nombre: 'Ricardo Oliveira', pista: 'Real Zaragoza' },
      { nombre: 'Raúl', pista: 'Real Madrid' },
      { nombre: 'Sergio Agüero', pista: 'Atlético de Madrid' },
      { nombre: 'Samuel Eto\'o', pista: 'FC Barcelona' },
      { nombre: 'Ruud Van Nistelrooy', pista: 'Real Madrid' },
      { nombre: 'Javi Llorente', pista: 'Real Valladolid' },
    ]
  },
  {
    id: 'laliga_2007', titulo: 'Goleadores LaLiga 2006/07', pista: 'equipo',
    top10: [
      { nombre: 'Ruud Van Nistelrooy', pista: 'Real Madrid' },
      { nombre: 'Diego Milito', pista: 'Real Zaragoza' },
      { nombre: 'Frédéric Kanouté', pista: 'Sevilla' },
      { nombre: 'Ronaldinho', pista: 'FC Barcelona' },
      { nombre: 'Diego Forlán', pista: 'Villarreal' },
      { nombre: 'Raúl Tamudo', pista: 'Espanyol' },
      { nombre: 'Fernando Baiano', pista: 'Celta' },
      { nombre: 'David Villa', pista: 'Valencia' },
      { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
      { nombre: 'Fernando Torres', pista: 'Atlético de Madrid' },
    ]
  },
  {
    id: 'laliga_2006', titulo: 'Goleadores LaLiga 2005/06', pista: 'equipo',
    top10: [
      { nombre: 'Samuel Eto\'o', pista: 'FC Barcelona' },
      { nombre: 'David Villa', pista: 'Valencia' },
      { nombre: 'Ronaldinho', pista: 'FC Barcelona' },
      { nombre: 'Diego Milito', pista: 'Real Zaragoza' },
      { nombre: 'Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Fernando Baiano', pista: 'Celta' },
      { nombre: 'Fernando Torres', pista: 'Atlético de Madrid' },
      { nombre: 'Joaquín Riquelme', pista: 'Villarreal' },
      { nombre: 'Ewerthon', pista: 'Real Zaragoza' },
      { nombre: 'Savo Milosevic', pista: 'Osasuna' },
    ]
  },
  {
    id: 'laliga_2005', titulo: 'Goleadores LaLiga 2004/05', pista: 'equipo',
    top10: [
      { nombre: 'Samuel Eto\'o', pista: 'FC Barcelona' },
      { nombre: 'Diego Forlán', pista: 'Villarreal' },
      { nombre: 'Ricardo Oliveira', pista: 'Real Betis' },
      { nombre: 'Ronaldo', pista: 'Real Madrid' },
      { nombre: 'José Baptista', pista: 'Sevilla' },
      { nombre: 'Fernando Torres', pista: 'Atlético de Madrid' },
      { nombre: 'David Villa', pista: 'Real Zaragoza' },
      { nombre: 'Joaquín Riquelme', pista: 'Villarreal' },
      { nombre: 'Marcelino Rodríguez', pista: 'Espanyol' },
      { nombre: 'Nihat', pista: 'Real Sociedad' },
    ]
  },
  {
    id: 'laliga_2004', titulo: 'Goleadores LaLiga 2003/04', pista: 'equipo',
    top10: [
      { nombre: 'Ronaldo', pista: 'Real Madrid' },
      { nombre: 'José Baptista', pista: 'Sevilla' },
      { nombre: 'Raúl Tamudo', pista: 'Espanyol' },
      { nombre: 'Mista', pista: 'Valencia' },
      { nombre: 'Fernando Torres', pista: 'Atlético de Madrid' },
      { nombre: 'Salva Ballesta', pista: 'Málaga' },
      { nombre: 'Samuel Eto\'o', pista: 'Mallorca' },
      { nombre: 'David Villa', pista: 'Real Zaragoza' },
      { nombre: 'Ronaldinho', pista: 'FC Barcelona' },
      { nombre: 'Nihat', pista: 'Real Sociedad' },
    ]
  },
  {
    id: 'laliga_2003', titulo: 'Goleadores LaLiga 2002/03', pista: 'equipo',
    top10: [
      { nombre: 'Roy Makaay', pista: 'RC Deportivo' },
      { nombre: 'Ronaldo', pista: 'Real Madrid' },
      { nombre: 'Nihat', pista: 'Real Sociedad' },
      { nombre: 'Darko Kovacevic', pista: 'Real Sociedad' },
      { nombre: 'Raúl', pista: 'Real Madrid' },
      { nombre: 'Patrick Kluivert', pista: 'FC Barcelona' },
      { nombre: 'Javi Guerrero', pista: 'Racing' },
      { nombre: 'Fernando', pista: 'Real Betis' },
      { nombre: 'Samuel Eto\'o', pista: 'Mallorca' },
      { nombre: 'Joseba Etxeberria', pista: 'Athletic Club' },
    ]
  },
  {
    id: 'laliga_2002', titulo: 'Goleadores LaLiga 2001/02', pista: 'equipo',
    top10: [
      { nombre: 'Diego Tristán', pista: 'RC Deportivo' },
      { nombre: 'Patrick Kluivert', pista: 'FC Barcelona' },
      { nombre: 'Fernando Morientes', pista: 'Real Madrid' },
      { nombre: 'Raúl Tamudo', pista: 'Espanyol' },
      { nombre: 'Javier Saviola', pista: 'FC Barcelona' },
      { nombre: 'Catanha', pista: 'Celta' },
      { nombre: 'Ismael Urzaiz', pista: 'Athletic Club' },
      { nombre: 'Fernando', pista: 'Real Valladolid' },
      { nombre: 'Víctor', pista: 'Villarreal' },
      { nombre: 'Raúl', pista: 'Real Madrid' },
    ]
  },
  {
    id: 'laliga_2001', titulo: 'Goleadores LaLiga 2000/01', pista: 'equipo',
    top10: [
      { nombre: 'Raúl', pista: 'Real Madrid' },
      { nombre: 'Rivaldo', pista: 'FC Barcelona' },
      { nombre: 'Javi Moreno', pista: 'Deportivo Alavés' },
      { nombre: 'Diego Tristán', pista: 'RC Deportivo' },
      { nombre: 'Patrick Kluivert', pista: 'FC Barcelona' },
      { nombre: 'Dely Valdés', pista: 'Málaga' },
      { nombre: 'Roy Makaay', pista: 'RC Deportivo' },
      { nombre: 'Catanha', pista: 'Celta' },
      { nombre: 'Oli', pista: 'Real Oviedo' },
      { nombre: 'Gutí', pista: 'Real Madrid' },
    ]
  },
  {
    id: 'laliga_2000', titulo: 'Goleadores LaLiga 1999/00', pista: 'equipo',
    top10: [
      { nombre: 'Salva Ballesta', pista: 'Racing' },
      { nombre: 'Catanha', pista: 'Málaga' },
      { nombre: 'Jimmy Floyd Hasselbaink', pista: 'Atlético de Madrid' },
      { nombre: 'Roy Makaay', pista: 'RC Deportivo' },
      { nombre: 'Savo Milosevic', pista: 'Real Zaragoza' },
      { nombre: 'Diego Tristán', pista: 'Mallorca' },
      { nombre: 'Raúl', pista: 'Real Madrid' },
      { nombre: 'Patrick Kluivert', pista: 'FC Barcelona' },
      { nombre: 'Gaizka Mendieta', pista: 'Valencia' },
      { nombre: 'Víctor', pista: 'Real Valladolid' },
    ]
  },
  {
    id: 'champions_titulos', titulo: 'Más títulos Champions League', pista: 'país',
    top10: [
      { nombre: 'Real Madrid', pista: '🇪🇸 España' },
      { nombre: 'AC Milan', pista: '🇮🇹 Italia' },
      { nombre: 'Liverpool', pista: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra' },
      { nombre: 'Bayern de Múnich', pista: '🇩🇪 Alemania' },
      { nombre: 'FC Barcelona', pista: '🇪🇸 España' },
      { nombre: 'Ajax', pista: '🇳🇱 Holanda' },
      { nombre: 'Inter de Milán', pista: '🇮🇹 Italia' },
      { nombre: 'Manchester United', pista: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra' },
      { nombre: 'Chelsea', pista: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra' },
      { nombre: 'Juventus', pista: '🇮🇹 Italia' },
    ]
  },
]

export function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
}

export function checkAnswer(input, item) {
  const inp = normalize(input)
  if (!inp || inp.length < 2) return false
  const full = normalize(item.nombre)
  if (inp === full) return true
  const parts = full.split(' ')
  for (const part of parts) {
    if (part.length >= 3 && inp === part) return true
  }
  return false
}

export function getRandomCat() {
  return CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)]
}
