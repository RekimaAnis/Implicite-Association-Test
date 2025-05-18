MONGO_FOLDER = dbData/
FEMININE_WORDS = misc/feminine_words.json
MASCULINE_WORDS = misc/masculine_words.json 
LITERATURE_WORDS = misc/literature_words.json 
SCIENCE_WORDS = misc/science_words.json 
DATABASE = TestBase 
WORD_COLLECTION = word 

webpack: 
	cd client ; ./node_modules/.bin/webpack --watch

create-mongo: 
	cd server ; mkdir ${MONGO_FOLDER}

clean-mongo: 
	cd server ; rm -f ${MONGO_FOLDER}

mongo: 
	cd server ; mongod --dbpath ${MONGO_FOLDER}

server: 
	cd server ; nodemon 

fill-mongo: 
	cd server ; mongoimport --db ${DATABASE} --collection ${WORD_COLLECTION} --file $(FEMININE_WORDS) 
	cd server ; mongoimport --db ${DATABASE} --collection ${WORD_COLLECTION} --file $(MASCULINE_WORDS) 
	cd server ; mongoimport --db ${DATABASE} --collection ${WORD_COLLECTION} --file $(LITERATURE_WORDS) 
	cd server ; mongoimport --db ${DATABASE} --collection ${WORD_COLLECTION} --file $(SCIENCE_WORDS) 


help:
	@echo "     available commands :                                 "
	@echo "     make create-mongo -> create mongoDB folder           "
	@echo "     make mongo        -> launch DataBase in ${MONGO_FOLDER}     "
	@echo "     make clean-mongo  -> clean mongoDB folder             "
	@echo "     make webpack      -> refresh webpack with the newer files "
	@echo "     make server       -> launch the server with nodemon"


# git stash push -m "mes changements temporaires" git checkout game git stash pop

.PHONY: webpack create-mongo clean-mongo mongo help server
