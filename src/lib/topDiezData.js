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
      // NUEVAS CATEGORÍAS PREMIER LEAGUE para añadir a topDiezData.js
// Ordenadas de más reciente a más antigua (2025/26 → 1999/00)
// Pista = equipo

const PREMIER_CATEGORIAS = [
  {
    id: 'premier_2026', titulo: 'Goleadores Premier League 2025/26', pista: 'equipo',
    top10: [
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Alexander Isak', pista: 'Newcastle' },
      { nombre: 'Erling Haaland', pista: 'Manchester City' },
      { nombre: 'Chris Wood', pista: 'Nottingham Forest' },
      { nombre: 'Bryan Mbeumo', pista: 'Brentford' },
      { nombre: 'Yoane Wissa', pista: 'Brentford' },
      { nombre: 'Ollie Watkins', pista: 'Aston Villa' },
      { nombre: 'Matheus Cunha', pista: 'Wolves' },
      { nombre: 'Cole Palmer', pista: 'Chelsea' },
      { nombre: 'Jean Mateta', pista: 'Crystal Palace' },
    ]
  },
  {
    id: 'premier_2025', titulo: 'Goleadores Premier League 2024/25', pista: 'equipo',
    top10: [
      { nombre: 'Erling Haaland', pista: 'Manchester City' },
      { nombre: 'Cole Palmer', pista: 'Chelsea' },
      { nombre: 'Alexander Isak', pista: 'Newcastle' },
      { nombre: 'Phil Foden', pista: 'Manchester City' },
      { nombre: 'Ollie Watkins', pista: 'Aston Villa' },
      { nombre: 'Dominic Solanke', pista: 'AFC Bournemouth' },
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Heung-Min Son', pista: 'Tottenham Hotspur' },
      { nombre: 'Jarrod Bowen', pista: 'West Ham' },
      { nombre: 'Bukayo Saka', pista: 'Arsenal' },
    ]
  },
  {
    id: 'premier_2024', titulo: 'Goleadores Premier League 2023/24', pista: 'equipo',
    top10: [
      { nombre: 'Erling Haaland', pista: 'Manchester City' },
      { nombre: 'Cole Palmer', pista: 'Chelsea' },
      { nombre: 'Alexander Isak', pista: 'Newcastle' },
      { nombre: 'Ollie Watkins', pista: 'Aston Villa' },
      { nombre: 'Phil Foden', pista: 'Manchester City' },
      { nombre: 'V. Gyokeres', pista: 'Arsenal' },
      { nombre: 'D. Calvert-Lewin', pista: 'Leeds United' },
      { nombre: 'Junior Kroupi', pista: 'AFC Bournemouth' },
      { nombre: 'Danny Welbeck', pista: 'Brighton' },
      { nombre: 'Jean Mateta', pista: 'Crystal Palace' },
    ]
  },
  {
    id: 'premier_2023', titulo: 'Goleadores Premier League 2022/23', pista: 'equipo',
    top10: [
      { nombre: 'Erling Haaland', pista: 'Manchester City' },
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Ivan Toney', pista: 'Brentford' },
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Callum Wilson', pista: 'Newcastle' },
      { nombre: 'Marcus Rashford', pista: 'Manchester United' },
      { nombre: 'Gabriel Martinelli', pista: 'Arsenal' },
      { nombre: 'Ollie Watkins', pista: 'Aston Villa' },
      { nombre: 'Martin Odegaard', pista: 'Arsenal' },
      { nombre: 'Aleksandar Mitrovic', pista: 'Fulham' },
    ]
  },
  {
    id: 'premier_2022', titulo: 'Goleadores Premier League 2021/22', pista: 'equipo',
    top10: [
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Heung-Min Son', pista: 'Tottenham Hotspur' },
      { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Sadio Mane', pista: 'Liverpool' },
      { nombre: 'Jamie Vardy', pista: 'Leicester' },
      { nombre: 'Kevin De Bruyne', pista: 'Manchester City' },
      { nombre: 'Diogo Jota', pista: 'Liverpool' },
      { nombre: 'Wilfried Zaha', pista: 'Crystal Palace' },
      { nombre: 'Raheem Sterling', pista: 'Manchester City' },
    ]
  },
  {
    id: 'premier_2021', titulo: 'Goleadores Premier League 2020/21', pista: 'equipo',
    top10: [
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Bruno Fernandes', pista: 'Manchester United' },
      { nombre: 'Heung-Min Son', pista: 'Tottenham Hotspur' },
      { nombre: 'Patrick Bamford', pista: 'Leeds United' },
      { nombre: 'Dominic Calvert-Lewin', pista: 'Everton' },
      { nombre: 'Jamie Vardy', pista: 'Leicester' },
      { nombre: 'Ollie Watkins', pista: 'Aston Villa' },
      { nombre: 'Ilkay Gundogan', pista: 'Manchester City' },
      { nombre: 'Alexandre Lacazette', pista: 'Arsenal' },
    ]
  },
  {
    id: 'premier_2020', titulo: 'Goleadores Premier League 2019/20', pista: 'equipo',
    top10: [
      { nombre: 'Jamie Vardy', pista: 'Leicester' },
      { nombre: 'Pierre-Emerick Aubameyang', pista: 'Arsenal' },
      { nombre: 'Danny Ings', pista: 'Southampton' },
      { nombre: 'Raheem Sterling', pista: 'Manchester City' },
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Sadio Mane', pista: 'Liverpool' },
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Marcus Rashford', pista: 'Manchester United' },
      { nombre: 'Tammy Abraham', pista: 'Chelsea' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
    ]
  },
  {
    id: 'premier_2019', titulo: 'Goleadores Premier League 2018/19', pista: 'equipo',
    top10: [
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Pierre-Emerick Aubameyang', pista: 'Arsenal' },
      { nombre: 'Sadio Mane', pista: 'Liverpool' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Jamie Vardy', pista: 'Leicester' },
      { nombre: 'Raheem Sterling', pista: 'Manchester City' },
      { nombre: 'Roberto Firmino', pista: 'Liverpool' },
      { nombre: 'Alexandre Lacazette', pista: 'Arsenal' },
      { nombre: 'Eden Hazard', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2018', titulo: 'Goleadores Premier League 2017/18', pista: 'equipo',
    top10: [
      { nombre: 'Mohamed Salah', pista: 'Liverpool' },
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Jamie Vardy', pista: 'Leicester' },
      { nombre: 'Raheem Sterling', pista: 'Manchester City' },
      { nombre: 'Romelu Lukaku', pista: 'Manchester United' },
      { nombre: 'Roberto Firmino', pista: 'Liverpool' },
      { nombre: 'Alexandre Lacazette', pista: 'Arsenal' },
      { nombre: 'Gabriel Jesus', pista: 'Manchester City' },
      { nombre: 'Eden Hazard', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2017', titulo: 'Goleadores Premier League 2016/17', pista: 'equipo',
    top10: [
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Romelu Lukaku', pista: 'Everton' },
      { nombre: 'Alexis Sanchez', pista: 'Arsenal' },
      { nombre: 'Diego Costa', pista: 'Chelsea' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Dele Alli', pista: 'Tottenham Hotspur' },
      { nombre: 'Zlatan Ibrahimovic', pista: 'Manchester United' },
      { nombre: 'Joshua King', pista: 'AFC Bournemouth' },
      { nombre: 'Eden Hazard', pista: 'Chelsea' },
      { nombre: 'Fernando Llorente', pista: 'Swansea City' },
    ]
  },
  {
    id: 'premier_2016', titulo: 'Goleadores Premier League 2015/16', pista: 'equipo',
    top10: [
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Jamie Vardy', pista: 'Leicester' },
      { nombre: 'Romelu Lukaku', pista: 'Everton' },
      { nombre: 'Riyad Mahrez', pista: 'Leicester' },
      { nombre: 'Olivier Giroud', pista: 'Arsenal' },
      { nombre: 'Jermain Defoe', pista: 'Sunderland' },
      { nombre: 'Ighalo', pista: 'Watford' },
      { nombre: 'Alexis Sanchez', pista: 'Arsenal' },
      { nombre: 'Diego Costa', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2015', titulo: 'Goleadores Premier League 2014/15', pista: 'equipo',
    top10: [
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
      { nombre: 'Diego Costa', pista: 'Chelsea' },
      { nombre: 'Charlie Austin', pista: 'Queens Park Rangers' },
      { nombre: 'Alexis Sanchez', pista: 'Arsenal' },
      { nombre: 'Olivier Giroud', pista: 'Arsenal' },
      { nombre: 'Saido Berahino', pista: 'West Bromwich Albion' },
      { nombre: 'Eden Hazard', pista: 'Chelsea' },
      { nombre: 'Christian Benteke', pista: 'Aston Villa' },
      { nombre: 'David Silva', pista: 'Manchester City' },
    ]
  },
  {
    id: 'premier_2014', titulo: 'Goleadores Premier League 2013/14', pista: 'equipo',
    top10: [
      { nombre: 'Luis Suarez', pista: 'Liverpool' },
      { nombre: 'Daniel Sturridge', pista: 'Liverpool' },
      { nombre: 'Yaya Toure', pista: 'Manchester City' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Wayne Rooney', pista: 'Manchester United' },
      { nombre: 'Wilfried Bony', pista: 'Swansea City' },
      { nombre: 'Edin Dzeko', pista: 'Manchester City' },
      { nombre: 'Olivier Giroud', pista: 'Arsenal' },
      { nombre: 'Romelu Lukaku', pista: 'Everton' },
      { nombre: 'Jay Rodriguez', pista: 'Southampton' },
    ]
  },
  {
    id: 'premier_2013', titulo: 'Goleadores Premier League 2012/13', pista: 'equipo',
    top10: [
      { nombre: 'Robin van Persie', pista: 'Manchester United' },
      { nombre: 'Luis Suarez', pista: 'Liverpool' },
      { nombre: 'Gareth Bale', pista: 'Tottenham Hotspur' },
      { nombre: 'Christian Benteke', pista: 'Aston Villa' },
      { nombre: 'Michu', pista: 'Swansea City' },
      { nombre: 'Romelu Lukaku', pista: 'West Bromwich Albion' },
      { nombre: 'Frank Lampard', pista: 'Chelsea' },
      { nombre: 'Dimitar Berbatov', pista: 'Fulham' },
      { nombre: 'Demba Ba', pista: 'Chelsea' },
      { nombre: 'Robin Lambert', pista: 'Southampton' },
    ]
  },
  {
    id: 'premier_2012', titulo: 'Goleadores Premier League 2011/12', pista: 'equipo',
    top10: [
      { nombre: 'Robin van Persie', pista: 'Arsenal' },
      { nombre: 'Wayne Rooney', pista: 'Manchester United' },
      { nombre: 'Sergio Aguero', pista: 'Manchester City' },
      { nombre: 'Yakubu Ayegbeni', pista: 'Blackburn Rovers' },
      { nombre: 'Emmanuel Adebayor', pista: 'Tottenham Hotspur' },
      { nombre: 'Clint Dempsey', pista: 'Fulham' },
      { nombre: 'Demba Ba', pista: 'Newcastle' },
      { nombre: 'Edin Dzeko', pista: 'Manchester City' },
      { nombre: 'Papiss Cisse', pista: 'Newcastle' },
      { nombre: 'Mario Balotelli', pista: 'Manchester City' },
    ]
  },
  {
    id: 'premier_2011', titulo: 'Goleadores Premier League 2010/11', pista: 'equipo',
    top10: [
      { nombre: 'Dimitar Berbatov', pista: 'Manchester United' },
      { nombre: 'Carlos Tevez', pista: 'Manchester City' },
      { nombre: 'Robin van Persie', pista: 'Arsenal' },
      { nombre: 'Darren Bent', pista: 'Aston Villa' },
      { nombre: 'Peter Odemwingie', pista: 'West Bromwich Albion' },
      { nombre: 'Andy Carroll', pista: 'Liverpool' },
      { nombre: 'Chicharito', pista: 'Manchester United' },
      { nombre: 'Rafael Van Der Vaart', pista: 'Tottenham Hotspur' },
      { nombre: 'Dirk Kuyt', pista: 'Liverpool' },
      { nombre: 'Florent Malouda', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2010', titulo: 'Goleadores Premier League 2009/10', pista: 'equipo',
    top10: [
      { nombre: 'Didier Drogba', pista: 'Chelsea' },
      { nombre: 'Wayne Rooney', pista: 'Manchester United' },
      { nombre: 'Darren Bent', pista: 'Sunderland' },
      { nombre: 'Carlos Tevez', pista: 'Manchester City' },
      { nombre: 'Frank Lampard', pista: 'Chelsea' },
      { nombre: 'Fernando Torres', pista: 'Liverpool' },
      { nombre: 'Jermain Defoe', pista: 'Tottenham Hotspur' },
      { nombre: 'Cesc Fabregas', pista: 'Arsenal' },
      { nombre: 'Emmanuel Adebayor', pista: 'Manchester City' },
      { nombre: 'Louis Saha', pista: 'Everton' },
    ]
  },
  {
    id: 'premier_2009', titulo: 'Goleadores Premier League 2008/09', pista: 'equipo',
    top10: [
      { nombre: 'Nicolas Anelka', pista: 'Chelsea' },
      { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
      { nombre: 'Steven Gerrard', pista: 'Liverpool' },
      { nombre: 'Fernando Torres', pista: 'Liverpool' },
      { nombre: 'Robinho', pista: 'Manchester City' },
      { nombre: 'Wayne Rooney', pista: 'Manchester United' },
      { nombre: 'Darren Bent', pista: 'Tottenham Hotspur' },
      { nombre: 'Gabriel Agbonlahor', pista: 'Aston Villa' },
      { nombre: 'Frank Lampard', pista: 'Chelsea' },
      { nombre: 'Dirk Kuyt', pista: 'Liverpool' },
    ]
  },
  {
    id: 'premier_2008', titulo: 'Goleadores Premier League 2007/08', pista: 'equipo',
    top10: [
      { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
      { nombre: 'Fernando Torres', pista: 'Liverpool' },
      { nombre: 'Emmanuel Adebayor', pista: 'Arsenal' },
      { nombre: 'Roque Santa Cruz', pista: 'Blackburn Rovers' },
      { nombre: 'Yakubu Ayegbeni', pista: 'Everton' },
      { nombre: 'Benjani Mwaruwari', pista: 'Manchester City' },
      { nombre: 'Dimitar Berbatov', pista: 'Tottenham Hotspur' },
      { nombre: 'Robbie Keane', pista: 'Tottenham Hotspur' },
      { nombre: 'Carlos Tevez', pista: 'Manchester United' },
      { nombre: 'John Carew', pista: 'Aston Villa' },
    ]
  },
  {
    id: 'premier_2007', titulo: 'Goleadores Premier League 2006/07', pista: 'equipo',
    top10: [
      { nombre: 'Didier Drogba', pista: 'Chelsea' },
      { nombre: 'Benni McCarthy', pista: 'Blackburn Rovers' },
      { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
      { nombre: 'Mark Viduka', pista: 'Middlesbrough' },
      { nombre: 'Wayne Rooney', pista: 'Manchester United' },
      { nombre: 'Darren Bent', pista: 'Charlton Athletic' },
      { nombre: 'Kevin Doyle', pista: 'Reading' },
      { nombre: 'Dimitar Berbatov', pista: 'Tottenham Hotspur' },
      { nombre: 'Dirk Kuyt', pista: 'Liverpool' },
      { nombre: 'Robin van Persie', pista: 'Arsenal' },
    ]
  },
  {
    id: 'premier_2006', titulo: 'Goleadores Premier League 2005/06', pista: 'equipo',
    top10: [
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Ruud van Nistelrooy', pista: 'Manchester United' },
      { nombre: 'Darren Bent', pista: 'Charlton Athletic' },
      { nombre: 'Frank Lampard', pista: 'Chelsea' },
      { nombre: 'Wayne Rooney', pista: 'Manchester United' },
      { nombre: 'Robbie Keane', pista: 'Tottenham Hotspur' },
      { nombre: 'Marlon Harewood', pista: 'West Ham' },
      { nombre: 'Craig Bellamy', pista: 'Blackburn Rovers' },
      { nombre: 'Yakubu Ayegbeni', pista: 'Middlesbrough' },
      { nombre: 'Didier Drogba', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2005', titulo: 'Goleadores Premier League 2004/05', pista: 'equipo',
    top10: [
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Andrew Johnson', pista: 'Crystal Palace' },
      { nombre: 'Robert Pires', pista: 'Arsenal' },
      { nombre: 'Yakubu Ayegbeni', pista: 'Portsmouth' },
      { nombre: 'Jermain Defoe', pista: 'Tottenham Hotspur' },
      { nombre: 'Jimmy Floyd Hasselbaink', pista: 'Middlesbrough' },
      { nombre: 'Frank Lampard', pista: 'Chelsea' },
      { nombre: 'Peter Crouch', pista: 'Southampton' },
      { nombre: 'Andy Cole', pista: 'Fulham' },
      { nombre: 'Eidur Gudjohnsen', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2004', titulo: 'Goleadores Premier League 2003/04', pista: 'equipo',
    top10: [
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Alan Shearer', pista: 'Newcastle' },
      { nombre: 'Ruud van Nistelrooy', pista: 'Manchester United' },
      { nombre: 'Louis Saha', pista: 'Fulham' },
      { nombre: 'Nicolas Anelka', pista: 'Manchester City' },
      { nombre: 'Mikael Forssell', pista: 'Birmingham City' },
      { nombre: 'Michael Owen', pista: 'Liverpool' },
      { nombre: 'Juan Angel', pista: 'Aston Villa' },
      { nombre: 'Yakubu Ayegbeni', pista: 'Portsmouth' },
      { nombre: 'Robert Pires', pista: 'Arsenal' },
    ]
  },
  {
    id: 'premier_2003', titulo: 'Goleadores Premier League 2002/03', pista: 'equipo',
    top10: [
      { nombre: 'Ruud van Nistelrooy', pista: 'Manchester United' },
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Jimmy Floyd Hasselbaink', pista: 'Chelsea' },
      { nombre: 'Alan Shearer', pista: 'Newcastle' },
      { nombre: 'Michael Owen', pista: 'Liverpool' },
      { nombre: 'Ole Gunnar Solskjaer', pista: 'Manchester United' },
      { nombre: 'Robbie Fowler', pista: 'Leeds United' },
      { nombre: 'Eidur Gudjohnsen', pista: 'Chelsea' },
      { nombre: 'Marians Pahars', pista: 'Southampton' },
      { nombre: 'Andy Cole', pista: 'Blackburn Rovers' },
    ]
  },
  {
    id: 'premier_2002', titulo: 'Goleadores Premier League 2001/02', pista: 'equipo',
    top10: [
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Ruud van Nistelrooy', pista: 'Manchester United' },
      { nombre: 'Jimmy Floyd Hasselbaink', pista: 'Chelsea' },
      { nombre: 'Alan Shearer', pista: 'Newcastle' },
      { nombre: 'Michael Owen', pista: 'Liverpool' },
      { nombre: 'Teddy Sheringham', pista: 'Manchester United' },
      { nombre: 'Kevin Phillips', pista: 'Sunderland' },
      { nombre: 'Emile Heskey', pista: 'Liverpool' },
      { nombre: 'Alen Boksic', pista: 'Middlesbrough' },
      { nombre: 'Gus Poyet', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2001', titulo: 'Goleadores Premier League 2000/01', pista: 'equipo',
    top10: [
      { nombre: 'Jimmy Floyd Hasselbaink', pista: 'Chelsea' },
      { nombre: 'Marcus Stewart', pista: 'Ipswich Town' },
      { nombre: 'Mark Viduka', pista: 'Leeds United' },
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Michael Owen', pista: 'Liverpool' },
      { nombre: 'Teddy Sheringham', pista: 'Manchester United' },
      { nombre: 'Kevin Phillips', pista: 'Sunderland' },
      { nombre: 'Emile Heskey', pista: 'Liverpool' },
      { nombre: 'Alen Boksic', pista: 'Middlesbrough' },
      { nombre: 'Gus Poyet', pista: 'Chelsea' },
    ]
  },
  {
    id: 'premier_2000', titulo: 'Goleadores Premier League 1999/00', pista: 'equipo',
    top10: [
      { nombre: 'Kevin Phillips', pista: 'Sunderland' },
      { nombre: 'Alan Shearer', pista: 'Newcastle' },
      { nombre: 'Dwight Yorke', pista: 'Manchester United' },
      { nombre: 'Andy Cole', pista: 'Manchester United' },
      { nombre: 'Michael Bridges', pista: 'Leeds United' },
      { nombre: 'Thierry Henry', pista: 'Arsenal' },
      { nombre: 'Paolo Di Canio', pista: 'West Ham' },
      { nombre: 'Chris Armstrong', pista: 'Tottenham Hotspur' },
      { nombre: 'Steffen Iversen', pista: 'Tottenham Hotspur' },
      { nombre: 'Niall Quinn', pista: 'Sunderland' },
      // MÁS CATEGORÍAS para añadir a topDiezData.js

const MAS_CATEGORIAS = [
  {
    id: 'europa_league_goleadores', titulo: 'Máximos goleadores históricos Europa League', pista: 'país',
    top10: [
      { nombre: 'Pierre-Emerick Aubameyang', pista: '🇬🇦 Gabón' },
      { nombre: 'Henrik Larsson', pista: '🇸🇪 Suecia' },
      { nombre: 'Klaas-Jan Huntelaar', pista: '🇳🇱 Países Bajos' },
      { nombre: 'Radamel Falcao', pista: '🇨🇴 Colombia' },
      { nombre: 'Dieter Müller', pista: '🇩🇪 Alemania' },
      { nombre: 'Edin Dzeko', pista: '🇧🇦 Bosnia y Herzegovina' },
      { nombre: 'Bruno Fernandes', pista: '🇵🇹 Portugal' },
      { nombre: 'Romelu Lukaku', pista: '🇧🇪 Bélgica' },
      { nombre: 'Alexandre Lacazette', pista: '🇫🇷 Francia' },
      { nombre: 'Aritz Aduriz', pista: '🇪🇸 España' },
    ]
  },
]

console.log('Nuevas categorías:', MAS_CATEGORIAS.length)

// Añadir al array MAS_CATEGORIAS:
const BALON_ORO_2025 = {
  id: 'balon_oro_2025', titulo: 'Balón de Oro 2025 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Ousmane Dembele', pista: 'Paris Saint-Germain' },
    { nombre: 'Lamine Yamal', pista: 'FC Barcelona' },
    { nombre: 'Vitinha', pista: 'Paris Saint-Germain' },
    { nombre: 'Mohamed Salah', pista: 'Liverpool' },
    { nombre: 'Raphinha', pista: 'FC Barcelona' },
    { nombre: 'Achraf Hakimi', pista: 'Paris Saint-Germain' },
    { nombre: 'Kylian Mbappe', pista: 'Real Madrid' },
    { nombre: 'Cole Palmer', pista: 'Chelsea' },
    { nombre: 'Gianluigi Donnarumma', pista: 'Paris Saint-Germain' },
    { nombre: 'Nuno Mendes', pista: 'Paris Saint-Germain' },
  ]
}

const BALON_ORO_2024 = {
  id: 'balon_oro_2024', titulo: 'Balón de Oro 2024 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Rodri', pista: 'Manchester City' },
    { nombre: 'Vinicius Jr', pista: 'Real Madrid' },
    { nombre: 'Jude Bellingham', pista: 'Real Madrid' },
    { nombre: 'Dani Carvajal', pista: 'Real Madrid' },
    { nombre: 'Erling Haaland', pista: 'Manchester City' },
    { nombre: 'Kylian Mbappe', pista: 'Real Madrid' },
    { nombre: 'Lautaro Martinez', pista: 'Inter de Milan' },
    { nombre: 'Lamine Yamal', pista: 'FC Barcelona' },
    { nombre: 'Toni Kroos', pista: 'Real Madrid' },
    { nombre: 'Harry Kane', pista: 'Bayern Munich' },
  ]
}

const BALON_ORO_2023 = {
  id: 'balon_oro_2023', titulo: 'Balón de Oro 2023 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'Inter Miami' },
    { nombre: 'Erling Haaland', pista: 'Manchester City' },
    { nombre: 'Kylian Mbappe', pista: 'Paris Saint-Germain' },
    { nombre: 'Kevin De Bruyne', pista: 'Manchester City' },
    { nombre: 'Rodri', pista: 'Manchester City' },
    { nombre: 'Vinicius Jr', pista: 'Real Madrid' },
    { nombre: 'Julian Alvarez', pista: 'Manchester City' },
    { nombre: 'Victor Osimhen', pista: 'Napoles' },
    { nombre: 'Bernardo Silva', pista: 'Manchester City' },
    { nombre: 'Luka Modric', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2022 = {
  id: 'balon_oro_2022', titulo: 'Balón de Oro 2022 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Karim Benzema', pista: 'Real Madrid' },
    { nombre: 'Sadio Mane', pista: 'Bayern Munich' },
    { nombre: 'Kevin De Bruyne', pista: 'Manchester City' },
    { nombre: 'Robert Lewandowski', pista: 'FC Barcelona' },
    { nombre: 'Mohamed Salah', pista: 'Liverpool' },
    { nombre: 'Kylian Mbappe', pista: 'Paris Saint-Germain' },
    { nombre: 'Thibaut Courtois', pista: 'Real Madrid' },
    { nombre: 'Vinicius Jr', pista: 'Real Madrid' },
    { nombre: 'Luka Modric', pista: 'Real Madrid' },
    { nombre: 'Erling Haaland', pista: 'Manchester City' },
  ]
}

const BALON_ORO_2021 = {
  id: 'balon_oro_2021', titulo: 'Balón de Oro 2021 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'Paris Saint-Germain' },
    { nombre: 'Robert Lewandowski', pista: 'Bayern Munich' },
    { nombre: 'Jorginho', pista: 'Chelsea' },
    { nombre: 'Karim Benzema', pista: 'Real Madrid' },
    { nombre: 'N\'Golo Kante', pista: 'Chelsea' },
    { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
    { nombre: 'Mohamed Salah', pista: 'Liverpool' },
    { nombre: 'Kevin De Bruyne', pista: 'Manchester City' },
    { nombre: 'Kylian Mbappe', pista: 'Paris Saint-Germain' },
    { nombre: 'Gianluigi Donnarumma', pista: 'Paris Saint-Germain' },
  ]
}

const BALON_ORO_2019 = {
  id: 'balon_oro_2019', titulo: 'Balón de Oro 2019 - Top 10', pista: 'país',
  top10: [
    { nombre: 'Lionel Messi', pista: '🇦🇷 Argentina' },
    { nombre: 'Virgil van Dijk', pista: '🇳🇱 Países Bajos' },
    { nombre: 'Cristiano Ronaldo', pista: '🇵🇹 Portugal' },
    { nombre: 'Sadio Mane', pista: '🇸🇳 Senegal' },
    { nombre: 'Mohamed Salah', pista: '🇪🇬 Egipto' },
    { nombre: 'Kylian Mbappe', pista: '🇫🇷 Francia' },
    { nombre: 'Alisson Becker', pista: '🇧🇷 Brasil' },
    { nombre: 'Robert Lewandowski', pista: '🇵🇱 Polonia' },
    { nombre: 'Bernardo Silva', pista: '🇵🇹 Portugal' },
    { nombre: 'Riyad Mahrez', pista: '🇩🇿 Argelia' },
  ]
}

const BALON_ORO_2018 = {
  id: 'balon_oro_2018', titulo: 'Balón de Oro 2018 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Luka Modric', pista: 'Real Madrid' },
    { nombre: 'Cristiano Ronaldo', pista: 'Juventus' },
    { nombre: 'Antoine Griezmann', pista: 'Atletico de Madrid' },
    { nombre: 'Kylian Mbappe', pista: 'Paris Saint-Germain' },
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Mohamed Salah', pista: 'Liverpool' },
    { nombre: 'Raphael Varane', pista: 'Real Madrid' },
    { nombre: 'Eden Hazard', pista: 'Chelsea' },
    { nombre: 'Kevin De Bruyne', pista: 'Manchester City' },
    { nombre: 'Harry Kane', pista: 'Tottenham Hotspur' },
  ]
}

const BALON_ORO_2016 = {
  id: 'balon_oro_2016', titulo: 'Balón de Oro 2016 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Antoine Griezmann', pista: 'Atletico de Madrid' },
    { nombre: 'Luis Suarez', pista: 'FC Barcelona' },
    { nombre: 'Neymar', pista: 'FC Barcelona' },
    { nombre: 'Gareth Bale', pista: 'Real Madrid' },
    { nombre: 'Riyad Mahrez', pista: 'Leicester City' },
    { nombre: 'Jamie Vardy', pista: 'Leicester City' },
    { nombre: 'Gianluigi Buffon', pista: 'Juventus' },
    { nombre: 'Pepe', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2015 = {
  id: 'balon_oro_2015', titulo: 'Balón de Oro 2015 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Neymar', pista: 'FC Barcelona' },
    { nombre: 'Robert Lewandowski', pista: 'Bayern Munich' },
    { nombre: 'Luis Suarez', pista: 'FC Barcelona' },
    { nombre: 'Thomas Muller', pista: 'Bayern Munich' },
    { nombre: 'Manuel Neuer', pista: 'Bayern Munich' },
    { nombre: 'Eden Hazard', pista: 'Chelsea' },
    { nombre: 'Andres Iniesta', pista: 'FC Barcelona' },
    { nombre: 'Alexis Sanchez', pista: 'Arsenal' },
  ]
}

const BALON_ORO_2014 = {
  id: 'balon_oro_2014', titulo: 'Balón de Oro 2014 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Manuel Neuer', pista: 'Bayern Munich' },
    { nombre: 'Arjen Robben', pista: 'Bayern Munich' },
    { nombre: 'Thomas Muller', pista: 'Bayern Munich' },
    { nombre: 'Philipp Lahm', pista: 'Bayern Munich' },
    { nombre: 'Neymar', pista: 'FC Barcelona' },
    { nombre: 'James Rodriguez', pista: 'Real Madrid' },
    { nombre: 'Toni Kroos', pista: 'Real Madrid' },
    { nombre: 'Angel Di Maria', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2013 = {
  id: 'balon_oro_2013', titulo: 'Balón de Oro 2013 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Franck Ribery', pista: 'Bayern Munich' },
    { nombre: 'Zlatan Ibrahimovic', pista: 'Paris Saint-Germain' },
    { nombre: 'Radamel Falcao', pista: 'Atletico de Madrid' },
    { nombre: 'Arjen Robben', pista: 'Bayern Munich' },
    { nombre: 'Andres Iniesta', pista: 'FC Barcelona' },
    { nombre: 'Thomas Muller', pista: 'Bayern Munich' },
    { nombre: 'Robert Lewandowski', pista: 'Borussia Dortmund' },
    { nombre: 'Gareth Bale', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2012 = {
  id: 'balon_oro_2012', titulo: 'Balón de Oro 2012 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Andres Iniesta', pista: 'FC Barcelona' },
    { nombre: 'Xavi Hernandez', pista: 'FC Barcelona' },
    { nombre: 'Radamel Falcao', pista: 'Atletico de Madrid' },
    { nombre: 'Iker Casillas', pista: 'Real Madrid' },
    { nombre: 'Andrea Pirlo', pista: 'Juventus' },
    { nombre: 'Didier Drogba', pista: 'Shanghai Shenhua' },
    { nombre: 'Robin van Persie', pista: 'Manchester United' },
    { nombre: 'Zlatan Ibrahimovic', pista: 'Paris Saint-Germain' },
  ]
}

const BALON_ORO_2011 = {
  id: 'balon_oro_2011', titulo: 'Balón de Oro 2011 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Xavi Hernandez', pista: 'FC Barcelona' },
    { nombre: 'Andres Iniesta', pista: 'FC Barcelona' },
    { nombre: 'Wayne Rooney', pista: 'Manchester United' },
    { nombre: 'Luis Suarez', pista: 'Liverpool' },
    { nombre: 'Diego Forlan', pista: 'Atletico de Madrid' },
    { nombre: "Samuel Eto'o", pista: 'Anzhi Makhachkala' },
    { nombre: 'Iker Casillas', pista: 'Real Madrid' },
    { nombre: 'Neymar', pista: 'Santos' },
  ]
}

const BALON_ORO_2010 = {
  id: 'balon_oro_2010', titulo: 'Balón de Oro 2010 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Andres Iniesta', pista: 'FC Barcelona' },
    { nombre: 'Xavi Hernandez', pista: 'FC Barcelona' },
    { nombre: 'Wesley Sneijder', pista: 'Inter de Milan' },
    { nombre: 'Diego Forlan', pista: 'Atletico de Madrid' },
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Iker Casillas', pista: 'Real Madrid' },
    { nombre: 'David Villa', pista: 'Valencia' },
    { nombre: 'Didier Drogba', pista: 'Chelsea' },
    { nombre: 'Xabi Alonso', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2009 = {
  id: 'balon_oro_2009', titulo: 'Balón de Oro 2009 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Cristiano Ronaldo', pista: 'Real Madrid' },
    { nombre: 'Xavi Hernandez', pista: 'FC Barcelona' },
    { nombre: 'Andres Iniesta', pista: 'FC Barcelona' },
    { nombre: "Samuel Eto'o", pista: 'Inter de Milan' },
    { nombre: 'Kaka', pista: 'Real Madrid' },
    { nombre: 'Zlatan Ibrahimovic', pista: 'FC Barcelona' },
    { nombre: 'Wayne Rooney', pista: 'Manchester United' },
    { nombre: 'Didier Drogba', pista: 'Chelsea' },
    { nombre: 'Steven Gerrard', pista: 'Liverpool' },
  ]
}

const BALON_ORO_2008 = {
  id: 'balon_oro_2008', titulo: 'Balón de Oro 2008 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Fernando Torres', pista: 'Liverpool' },
    { nombre: 'Iker Casillas', pista: 'Real Madrid' },
    { nombre: 'Xavi Hernandez', pista: 'FC Barcelona' },
    { nombre: 'Andrey Arshavin', pista: 'Zenit San Petersburgo' },
    { nombre: 'David Villa', pista: 'Valencia' },
    { nombre: 'Zlatan Ibrahimovic', pista: 'Inter de Milan' },
    { nombre: 'Kaka', pista: 'AC Milan' },
    { nombre: 'Steven Gerrard', pista: 'Liverpool' },
  ]
}

const BALON_ORO_2007 = {
  id: 'balon_oro_2007', titulo: 'Balón de Oro 2007 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Kaka', pista: 'AC Milan' },
    { nombre: 'Cristiano Ronaldo', pista: 'Manchester United' },
    { nombre: 'Lionel Messi', pista: 'FC Barcelona' },
    { nombre: 'Didier Drogba', pista: 'Chelsea' },
    { nombre: 'Andrea Pirlo', pista: 'AC Milan' },
    { nombre: 'Ruud van Nistelrooy', pista: 'Real Madrid' },
    { nombre: 'Zlatan Ibrahimovic', pista: 'Inter de Milan' },
    { nombre: 'Cesc Fabregas', pista: 'Arsenal' },
    { nombre: 'Robinho', pista: 'Real Madrid' },
    { nombre: 'Francesco Totti', pista: 'AS Roma' },
  ]
}

const BALON_ORO_2006 = {
  id: 'balon_oro_2006', titulo: 'Balón de Oro 2006 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Fabio Cannavaro', pista: 'Real Madrid' },
    { nombre: 'Gianluigi Buffon', pista: 'Juventus' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Ronaldinho', pista: 'FC Barcelona' },
    { nombre: 'Zinedine Zidane', pista: 'Real Madrid' },
    { nombre: "Samuel Eto'o", pista: 'FC Barcelona' },
    { nombre: 'Miroslav Klose', pista: 'Werder Bremen' },
    { nombre: 'Gianluca Zambrotta', pista: 'FC Barcelona' },
    { nombre: 'Michael Ballack', pista: 'Chelsea' },
    { nombre: 'Jens Lehmann', pista: 'Arsenal' },
  ]
}

const BALON_ORO_2005 = {
  id: 'balon_oro_2005', titulo: 'Balón de Oro 2005 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Ronaldinho', pista: 'FC Barcelona' },
    { nombre: 'Frank Lampard', pista: 'Chelsea' },
    { nombre: 'Steven Gerrard', pista: 'Liverpool' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Andriy Shevchenko', pista: 'AC Milan' },
    { nombre: 'Paolo Maldini', pista: 'AC Milan' },
    { nombre: 'Adriano', pista: 'Inter de Milan' },
    { nombre: 'Zlatan Ibrahimovic', pista: 'Juventus' },
    { nombre: 'Kaka', pista: 'AC Milan' },
    { nombre: "Samuel Eto'o", pista: 'FC Barcelona' },
  ]
}

const BALON_ORO_2004 = {
  id: 'balon_oro_2004', titulo: 'Balón de Oro 2004 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Andriy Shevchenko', pista: 'AC Milan' },
    { nombre: 'Deco', pista: 'FC Barcelona' },
    { nombre: 'Ronaldinho', pista: 'FC Barcelona' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Theodoros Zagorakis', pista: 'Bolonia' },
    { nombre: 'Adriano', pista: 'Inter de Milan' },
    { nombre: 'Pavel Nedved', pista: 'Juventus' },
    { nombre: 'Wayne Rooney', pista: 'Manchester United' },
    { nombre: 'Ricardo Carvalho', pista: 'Chelsea' },
    { nombre: 'Ruud van Nistelrooy', pista: 'Manchester United' },
  ]
}

const BALON_ORO_2003 = {
  id: 'balon_oro_2003', titulo: 'Balón de Oro 2003 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Pavel Nedved', pista: 'Juventus' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Paolo Maldini', pista: 'AC Milan' },
    { nombre: 'Andriy Shevchenko', pista: 'AC Milan' },
    { nombre: 'Zinedine Zidane', pista: 'Real Madrid' },
    { nombre: 'Ruud van Nistelrooy', pista: 'Manchester United' },
    { nombre: 'Raul Gonzalez', pista: 'Real Madrid' },
    { nombre: 'Roberto Carlos', pista: 'Real Madrid' },
    { nombre: 'Gianluigi Buffon', pista: 'Juventus' },
    { nombre: 'David Beckham', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2002 = {
  id: 'balon_oro_2002', titulo: 'Balón de Oro 2002 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Ronaldo Nazario', pista: 'Real Madrid' },
    { nombre: 'Roberto Carlos', pista: 'Real Madrid' },
    { nombre: 'Oliver Kahn', pista: 'Bayern Munich' },
    { nombre: 'Zinedine Zidane', pista: 'Real Madrid' },
    { nombre: 'Michael Ballack', pista: 'Bayern Munich' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Raul Gonzalez', pista: 'Real Madrid' },
    { nombre: 'Rivaldo', pista: 'AC Milan' },
    { nombre: 'Yildiray Basturk', pista: 'Bayer Leverkusen' },
    { nombre: 'Alessandro Del Piero', pista: 'Juventus' },
  ]
}

const BALON_ORO_2001 = {
  id: 'balon_oro_2001', titulo: 'Balón de Oro 2001 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Michael Owen', pista: 'Liverpool' },
    { nombre: 'Raul Gonzalez', pista: 'Real Madrid' },
    { nombre: 'Oliver Kahn', pista: 'Bayern Munich' },
    { nombre: 'David Beckham', pista: 'Manchester United' },
    { nombre: 'Francesco Totti', pista: 'AS Roma' },
    { nombre: 'Luis Figo', pista: 'Real Madrid' },
    { nombre: 'Rivaldo', pista: 'FC Barcelona' },
    { nombre: 'Andriy Shevchenko', pista: 'AC Milan' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Zinedine Zidane', pista: 'Real Madrid' },
  ]
}

const BALON_ORO_2000 = {
  id: 'balon_oro_2000', titulo: 'Balón de Oro 2000 - Top 10', pista: 'equipo',
  top10: [
    { nombre: 'Luis Figo', pista: 'Real Madrid' },
    { nombre: 'Zinedine Zidane', pista: 'Juventus' },
    { nombre: 'Andriy Shevchenko', pista: 'AC Milan' },
    { nombre: 'Thierry Henry', pista: 'Arsenal' },
    { nombre: 'Alessandro Nesta', pista: 'Lazio' },
    { nombre: 'Rivaldo', pista: 'FC Barcelona' },
    { nombre: 'Gabriel Batistuta', pista: 'AS Roma' },
    { nombre: 'Gaizka Mendieta', pista: 'Valencia' },
    { nombre: 'Raul Gonzalez', pista: 'Real Madrid' },
    { nombre: 'David Beckham', pista: 'Manchester United' },
  ]
}

  },
]

console.log('Categorías Premier League:', PREMIER_CATEGORIAS.length)

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
