# BOARD
*createNewBoard 		= [POST] 		/api/board
*getAllBoard 				= [GET] 		/api/board
*renameBoardTitle 	= [PATCH] 	/api/board?id=
*deleteBoard 				= [DELETE] 	/api/board?id=
*getBoardById 			= [GET] 		/api/board/[id]

# LIST | DONE
*createNewList 			= [POST] 		/api/list?boardId=
*getAllListInBoard 	= [GET] 		/api/list?boardId=
*renameListTitle 		= [PATCH] 	/api/list/?boardId=&id=
*deleteList 				= [DELETE] 	/api/list/[boardId]?id=
*copyList 					= [POST] 		/api/list/[boardId]?id=
*reorderedList 			= [PATCH] 	/api/list/[boardId]

# CARD
*createNewCard 			= [POST]		/api/card?listId=
*getCardById 				= [GET] 		/api/card?listId=&id=
*updateCard 				= [PATCH]		/api/card?listId=&id=
*deleteCard 				= [DELETE]	/api/card?listId=&id=
*reorderedCard 			= [PATCH]		/api/card/[boardId]
*copyCard 					= [POST]		/api/card/[baordId]?listId=&id=

# LOGS
