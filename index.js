const { MongoClient, ServerApiVersion } = require("mongodb");
const readline = require("readline");
const { ObjectId } = require("bson");

const uri =
  "mongodb+srv://o4450:Secrete4450@cluster0.itndudq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function createUser(collection, rl) {
  rl.question("Enter firstname: ", async (firstname) => {
    rl.question("Enter lastname: ", async (lastname) => {
      rl.question("Enter email: ", async (email) => {
        const documentToInsert = {
          firstname,
          lastname,
          email,
        };

        const result = await collection.insertOne(documentToInsert);
        console.log(`User created with _id: ${result.insertedId}`);

        mainMenu(collection, rl);
      });
    });
  });
}

async function deleteUser(collection, rl) {
  rl.question("Enter _id of the user to delete: ", async (_id) => {
    console.log("Deleting user with _id:", _id);
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(_id) }); // Use new ObjectId
      console.log("Delete operation result:", result);
      if (result.deletedCount === 1) {
        console.log("User deleted successfully.");
      } else {
        console.log("User not found with the provided _id.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }

    mainMenu(collection, rl);
  });
}

async function searchByLastname(collection, rl) {
  rl.question("Enter lastname to search: ", async (lastname) => {
    const users = await collection.find({ lastname }).toArray();
    console.log("Search results:");
    console.log(users);

    mainMenu(collection, rl);
  });
}

async function displayAllUsers(collection, rl) {
  const users = await collection.find({}).toArray();
  console.log("All users:");
  console.log(users);

  mainMenu(collection, rl);
}

async function updateUser(collection, rl) {
  rl.question("Enter _id of the user to update: ", async (_id) => {
    rl.question("Enter new firstname: ", async (firstname) => {
      rl.question("Enter new lastname: ", async (lastname) => {
        rl.question("Enter new email: ", async (email) => {
          try {
            const result = await collection.updateOne(
              { _id: new ObjectId(_id) }, // Ensure _id is converted to ObjectId
              { $set: { firstname, lastname, email } }
            );
            if (result.matchedCount === 1) {
              console.log("User updated successfully.");
            } else {
              console.log("User not found with the provided _id.");
            }
          } catch (error) {
            console.error("Error updating user:", error);
          }

          mainMenu(collection, rl);
        });
      });
    });
  });
}

async function mainMenu(collection, rl) {
  console.log("\nMenu:");
  console.log("1. Create a user");
  console.log("2. Delete a user by _id");
  console.log("3. Search by lastname");
  console.log("4. Display all users");
  console.log("5. Update by _id");
  console.log("6. Exit");

  rl.question("Select an option: ", async (option) => {
    switch (option) {
      case "1":
        await createUser(collection, rl);
        break;
      case "2":
        await deleteUser(collection, rl);
        break;
      case "3":
        await searchByLastname(collection, rl);
        break;
      case "4":
        await displayAllUsers(collection, rl);
        break;
      case "5":
        await updateUser(collection, rl);
        break;
      case "6":
        console.log("Exiting...");
        rl.close();
        await client.close();
        break;
      default:
        console.log("Invalid option.");
        mainMenu(collection, rl);
        break;
    }
  });
}

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const collection = client.db("bdx").collection("user");

    mainMenu(collection, rl);
  } catch (error) {
    console.error("Error:", error);
    await client.close();
  }
}

run();
