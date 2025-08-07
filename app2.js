import { createInterface } from "node:readline";
// import fs from "node:fs";
import Database from 'better-sqlite3';

// let addPets = [];
// let petId = 1;

const db = new Database('pets.db');

db.exec(`DROP TABLE IF EXISTS pets`);
db.exec(`
  CREATE TABLE product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    quantity TEXT NOT NULL,
    description INTEGER NOT NULL,
    category  TEXT NOT NULL
  )
`);


// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}
function mainMenu() {
  console.log("=============================");
  console.log(" Pet Adoption Center Manager");
  console.log("=============================");
  console.log("1. Add new pet");
  console.log("2. View all pets");
  console.log("3. Update pet information");
  console.log("4. Remove pet");
  console.log("5. Exit");
  console.log("=============================");
}

async function main() {
  // saveData();
  mainMenu();
  while (true) {
    let choice = await ask("\n Select an option (1-5): ");
    switch (choice) {
      case "1":
        await addPet();
        break;
      case "2":
        await viewAllPet();
        break;
      case "3":
        await petIdToUpdate();
        break;
      case "4":
        await removePet();
        break;
      case "5":
        console.log("Goodbye!");
        process.exit();

      default:
        console.log("Invalid option. Please enter a number between 1 and 5.");
    }
  }
}

async function addPet() {
  let petName = await ask("Pet's name: ");
  let petSpecies = await ask("Pet's species: ");
  let petBread = await ask("Pet's bread: ");
  let petAge = await ask("Pet's age: ");
  let petStatus = await ask("Pet's Available / Adopted / Removed (1/2/3): ");

  if (petStatus == 1) {
    petStatus = "Available";
  } else if (petStatus == 2) {
    petStatus = "Adopted";
  } else if (petStatus == 3) {
    petStatus = "Removed";
  } else {
    console.log("Enter valid number: ");
    return;
  }

try {
 const insert = db.prepare(`INSERT INTO pets (petName, species, breed, age, status) VALUES (?, ?, ?, ?, ?)`);
insert.run(petName, petSpecies, petBread, petAge, petStatus);
    console.log(" pets added successfully.");
  } catch (err) {
      console.log(" Error:", err.message);
  }

  await main();
}

async function viewAllPet() {
  const select = db.prepare(`SELECT * FROM pets`);
  const users = select.all();
  console.table(users);
  await main();
}
async function petIdToUpdate() {
  const id = await ask("Enter pet ID to update: ");
  const petName = await ask("New pet name: ");

  const update = db.prepare(`UPDATE pets SET petName = ? WHERE id = ?`);
  const result = update.run(petName, id);

  if (result.changes === 0) {
    console.log(" Pet not found.");
  } else {
    console.log(" Pet updated successfully.");
  }
  await main()
}

async function removePet(){
  const id = await ask("Enter pet ID to delete: ");
  const del = db.prepare(`DELETE FROM pets WHERE id = ?`);
  const result = del.run(id);
  if (result.changes === 0) {
    console.log(" User not found.");
  } else {
    console.log(" User deleted.");
  }
  await main()
}
main();
