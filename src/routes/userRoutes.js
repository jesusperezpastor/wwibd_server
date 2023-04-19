const { Router } = require('express');
const router = Router();

const User = require('../models/User');
const Board = require('../models/Board');
const jwt = require('jsonwebtoken');

const blacklist = new Set();

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://jesusperez:q6ENUEgwWkIih1ZM@wwibdbbdd.mfoejvu.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'wwibd';

async function connectToDB() {
    const client = new MongoClient(uri,
        { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1, socketTimeoutMS: 60000 });
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
}

//User Section
router.post('/user/singup', async (req, res) => {

    console.log(req.body);
    const { email, password, firstName, lastName, jobRole, city, country, phone } = req.body;
    const newUser = new User({ email, password, firstName, lastName, jobRole, city, country, phone });
    console.log("Registro de un nuevo usuario → email[", newUser.email, "], password[", newUser.password, "].");

    const db = await connectToDB();
    const users = db.collection("users");
    await users.insertOne(newUser);

    const token = jwt.sign({ _id: newUser._id }, 'secretkey');
    res.status(200).json({ token });
});

router.post('/user/singin', async (req, res) => {
    const { email, password } = req.body;
    const db = await connectToDB();
    const users = db.collection("users");
    const user = await users.findOne({ email });
    console.log("Login del usuario → email[", email, "].");

    if (!user) return res.status(401).send('El email introducido no existe.');
    if (user.password !== password) return res.status(401).send('Contraseña incorrecta.');

    const token = jwt.sign({ _id: user._id }, 'secretkey');
    return res.status(200).json({ token, user });
});

router.post('/user/logout', async (req, res) => {
    const token = req.headers.authorization;
    console.log(token);
    invalidateToken(token);
    res.status(200).json({ message: 'Logout exitoso' });
});


router.get('/user/getAllUsers', async (req, res) => {
    const token = req.headers.authorization;
    const db = await connectToDB();
    const users = db.collection("users");

    try {
        const allUsers = await users.find({}).toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function invalidateToken(token) {
    blacklist.add(token);
}

async function verifyToken(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send('Unauhtorized Request');
        }
        let token = req.headers.authorization.split(' ')[1];
        if (token === 'null') {
            return res.status(401).send('Unauhtorized Request');
        }
        if (blacklist.has(token)) {
            return res.status(401).send('Token has been invalidated');
        }
        const payload = await jwt.verify(token, 'secretkey');
        if (!payload) {
            return res.status(401).send('Unauhtorized Request');
        }
        req.userId = payload._id;
        next();
    } catch (e) {
        return res.status(401).send('Unauhtorized Request');
    }
}

//Board Section
router.post('/board/create', async (req, res) => {
    const token = req.headers.authorization;
    const boardToSave = Object.assign({}, req.body);

    const db = await connectToDB();
    const boards = db.collection("boards");

    boards.insertOne(boardToSave, (err, board) => {
        if (err) {
            console.log("Problema en la creación del nuevo board → name[", boardToSave.name, "], createdBy[", boardToSave.createdBy, "].");
            res.status(500).send(err);
        } else {
            console.log("Creación de un nuevo board → name[", boardToSave.name, "], createdBy[", boardToSave.createdBy, "].");
            res.status(201).json(board);
        }
    });
});

router.post('/board/update', async (req, res) => {
    // Recuperar el tablero enviado en el cuerpo de la petición
    const updatedBoard = req.body;
    
    // Recuperar el id del tablero a actualizar
    const boardId = updatedBoard._id;

    const db = await connectToDB();
    const boards = db.collection("boards");

    // Buscar el tablero original en la base de datos
    boards.findOne({ _id: boardId }, async (err, boardOriginal) => {
        if (err) {
            res.status(500).json({ error: 'Error al buscar el tablero' });
            return;
        }

        // Actualizar el tablero original con los datos enviados en la petición
        boardOriginal.name = updatedBoard.name;
        boardOriginal.list = updatedBoard.list;
        boardOriginal.cycleTimeStart = updatedBoard.cycleTimeStart;
        boardOriginal.cycleTimeStartIdList = updatedBoard.cycleTimeStartIdList;
        boardOriginal.cycleTimeEnd = updatedBoard.cycleTimeEnd;
        boardOriginal.cycleTimeEndIdList = updatedBoard.cycleTimeEndIdList;
        boardOriginal.users = updatedBoard.users;
        console.log(boardOriginal)
        // Actualizar el tablero en la base de datos
        const result = await boards.updateOne({ _id: boardId }, { $set: boardOriginal });

        if (result.modifiedCount === 1) {
            res.status(200).json({ success: true });
        }
    });
});


router.get('/board/getAllProjects', async (req, res) => {
    const token = req.headers.authorization;
    const db = await connectToDB();
    const boards = db.collection("boards");

    try {
        const allBoards = await boards.find({}).toArray();
        res.status(200).json(allBoards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/board/getAllProjectsByUser/:userEmail', async (req, res) => {
    const token = req.headers.authorization;
    const userEmail = req.params.userEmail;
    const db = await connectToDB();
    const boards = db.collection("boards");
    console.log(userEmail);
    try {
        const allBoards = await boards.find({ users: userEmail }).toArray();
        res.status(200).json(allBoards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/board/getBoardById/:boardId', async (req, res) => {
    const token = req.headers.authorization;
    const boardId = req.params.boardId;
    const db = await connectToDB();
    const boards = db.collection("boards");

    try {
        const board = await boards.findOne({ _id: boardId });
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        res.status(200).json(board);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/board/deleteBoardById/:boardId', async (req, res) => {
    const token = req.headers.authorization;
    const boardId = req.params.boardId;
    console.log(boardId)

    const db = await connectToDB();
    const boards = db.collection("boards");

    try {
        await boards.findOneAndDelete({ _id: ObjectId(boardId) });
        res.status(200).json({ message: 'Tablero eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/testApi', async (req, res) => {
    console.log("Connection Ok")
    res.status(200).json("Connection Ok");
});

module.exports = router;