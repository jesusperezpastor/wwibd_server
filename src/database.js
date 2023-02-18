const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jesusperez:q6ENUEgwWkIih1ZM@wwibdbbdd.mfoejvu.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri,
    { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1, socketTimeoutMS: 60000 });

client.connect(err => {
    if (err) {
        console.error(`Error de conexión: ${err}`);
        return;
    }
    console.log("Conexión exitosa a la base de datos cloud Mongo Atlas");
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});