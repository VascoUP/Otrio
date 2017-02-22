%%-----------------------
%%        MENUS
%%-----------------------

%% Predicate to exit the game
exitGame.


%% Predicate to clear the screen (it does 60 new lines)
cls :-
        nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,
        nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,
        nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,
        nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl.


%% Predicate that creates the game logo
logo:-
        write('|                                                                                 |'), nl,
        write('|       _ _ _ _      _ _ _ _ _ _      _ _ _       _ _ _ _ _ _       _ _ _ _       |'), nl,
        write('|     /    _    \\   |           |   /  _ _  \\    |           |    /    _    \\     |'), nl,
        write('|    |   /   \\   |  |_ _     _ _|  |  |   |  |   |_ _     _ _|   |   /   \\   |    |'), nl,
        write('|    |  |     |  |      |   |      |  |_ _|  |       |   |       |  |     |  |    |'), nl,
        write('|    |  |     |  |      |   |      |        /        |   |       |  |     |  |    |'), nl,
        write('|    |  |     |  |      |   |      |   |\\   \\     _ _|   |_ _    |  |     |  |    |'), nl,
        write('|    |   \\ _ /   |      |   |      |   | \\   \\   |           |   |   \\ _ /   |    |'), nl,
        write('|     \\ _ _ _ _ /       | _ |      |_ _|  \\_ _\\  |_ _ _ _ _ _|    \\ _ _ _ _ /     |'), nl,
        write('|                                                                                 |'), nl.


%% Predicate that creates the main menu
mainMenu:-      !, cls,
                write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                write('|                                                                                 |'), nl,
                logo,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                 Welcome!!!                                      |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                   1. Play                                                       |'), nl,
                write('|                   2. Game Rules                                                 |'), nl,
                write('|                   3. Credits                                                    |'), nl,
                write('|                   4. Exit                                                       |'), nl,
                write('|                                                                                 |'), nl,
                write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                nl, write('Option: '), get_char(R), get_char(_),
                (R = '1' -> !, playMenu;
                 R = '2' -> !, gameRules;
                 R = '3' -> !, credits;
                 R = '4' -> exitGame;
                 !, mainMenu).


%% Predicate that creates the game mode menu
playMenu:-      !, cls,
                write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                  Game Mode:                                                     |'), nl,
                write('|                                                                                 |'), nl,
                write('|                    1. Human vs Human                                            |'), nl,
                write('|                    2. Human vs Computer                                         |'), nl,
                write('|                    3. Computer vs Computer                                      |'), nl,
                write('|                    4. Return                                                    |'), nl,
                write('|                                                                                 |'), nl,
                write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                nl, write('Option: '), get_char(G), get_char(_),
                (G = '1' -> cls, not(game_cicle(player, player, _)), !, mainMenu;
                 G = '2' -> !, difficultyMenuPVC;
                 G = '3' -> !, difficultyMenuCVC;
                 G = '4' -> !, mainMenu;
                 !, playMenu).


%% Predicate that created the game rules
gameRules:-     !, cls,
                write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                Game Rules:                                      |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|   -> Each player has 32 pieces, 6 larges, 6 medium and 6 small and each one     |'), nl,
                write('|      of them must put the respective pieces in empty spaces, not being able     |'), nl,
                write('|      to move them after their placement                                         |'), nl,
                write('|                                                                                 |'), nl,
                write('|   -> If a player can not put one of his pieces, the turm changes to the other   |'), nl,
                write('|      player, so that they can place pieces until they reach a OTRIO             |'), nl,
                write('|                                                                                 |'), nl,
                write('|      How to make a OTRIO:                                                       |'), nl,
                write('|                                                                                 |'), nl,
                write('|      1. Have 3 pieces with the same size and color on a board row               |'), nl,
                write('|      2. Have 3 pieces of increasing or decreasing size on a board row           |'), nl,
                write('|      3. Have 3 concentic pieces inthe same place                                |'), nl,
                write('|                                                                                 |'), nl,
                write('|                                                                                 |'), nl,
                write('|                     Press ENTER to return to the main menu                      |'), nl,
                write('|                                                                                 |'), nl,
                write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                nl, get_char(_), !, mainMenu.


%% Predicate that creates the Human vs Computer difficulty menu
difficultyMenuPVC:- !, cls,
                    write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                    write('|                                                                                 |'), nl,
                    write('|                                                                                 |'), nl,
                    write('|                  Difficulty Human vs Computer:                                  |'), nl,
                    write('|                                                                                 |'), nl,
                    write('|                    1. Easy                                                      |'), nl,
                    write('|                    2. Hard                                                      |'), nl,
                    write('|                    3. Return                                                    |'), nl,
                    write('|                                                                                 |'), nl,
                    write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                    nl, write('Option: '), get_char(G), get_char(_),
                    (G = '1' -> random(0, 2, Y), (Y = 0 -> not( game_cicle(player, computer, easy) ), !, mainMenu;
                                                  Y = 1 -> not( game_cicle(computer, player, easy) ) ), !, mainMenu;
                     G = '2' -> random(0, 1, Y), (Y = 0 -> not( game_cicle(player, computer, hard) ), !, mainMenu;
                                                  Y = 1 -> not( game_cicle(computer, player, hard) ) ), !, mainMenu;
                     G = '3' -> !, cls, playMenu;
                     !, playMenu).


%% Predicate that creates the Computer vs Computer difficulty menu
difficultyMenuCVC:- !, cls,
                    write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                    write('|                                                                                 |'), nl,
                    write('|                                                                                 |'), nl,
                    write('|                  Difficulty Computer vs Computer:                               |'), nl,
                    write('|                                                                                 |'), nl,
                    write('|                    1. Easy                                                      |'), nl,
                    write('|                    2. Hard                                                      |'), nl,
                    write('|                    3. Return                                                    |'), nl,
                    write('|                                                                                 |'), nl,
                    write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
                    nl, write('Option: '), get_char(G), get_char(_),
                    (G = '1' -> not( game_cicle(computer, computer, easy) ), !, mainMenu;
                     G = '2' -> not( game_cicle(computer, computer, hard) ), !, mainMenu;
                     G = '3' -> !, playMenu;
                     !, playMenu).


%% Predicate that creates the game credits
credits:- cls,
          write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
          write('|                                                                                 |'), nl,
          write('|                                                                                 |'), nl,
          write('|                  Project developed by:                                          |'), nl,
          write('|                                                                                 |'), nl,
          write('|                    -> Sara Fernandes, up201405955                               |'), nl,
          write('|                    -> Vasco Pereira, up201403485                                |'), nl,
          write('|                                                                                 |'), nl,
          write('|                             Press ENTER to return                               |'), nl,
          write('|                                                                                 |'), nl,
          write(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - '), nl,
          get_char(_), mainMenu.
    