import { createInterface } from "node:readline";
import Database from "better-sqlite3";
const db = new Database("product.db");

db.exec(`
  CREATE  TABLE  IF NOT EXISTS  product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    costPrice INTEGER NOT NULL,
    salePrice INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    description INTEGER NOT NULL,
    category  TEXT NOT NULL
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS sale (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    customerName TEXT NOT NULL,
    productName TEXT NOT NULL,
    salePrice INTEGER NOT NULL,
    totalPrice INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    description INTEGER NOT NULL,
    category  TEXT NOT NULL,
    profit INTEGER NOT NULL,
    discount INTEGER,
    taxes INTEGER,
    createdAt DATE DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS supplier (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    companyName TEXT,
    email TEXT,
    phoneNumber TEXT NOT NULL,
    address TEXT,
    details TEXT
  )
`);

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
// ask question from user
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}
// This function shows instructions to the user
function mainMenu() {
  console.log("=============================");
  console.log(" Product Management");
  console.log("=============================");
  console.log("0. Add New Product");
  console.log("1. View All Product");
  console.log("2. Update Product information");
  console.log("3. Remove Product");
  console.log("4. search Product");
  console.log("5. Sale Product");
  console.log("6. View Sale Histroy");
  console.log("7. Search Sale Product");
  console.log("8. Add Supplier");
  console.log("9. View All Supplier");
  console.log("10. Update Supplier");
  console.log("11. Delete Supplier");
  console.log("12. Search Supplier");
  console.log("13. Refresh Database");
  console.log("15. Good Bye");
  // console.log("=============================");
}
// This is the main function that calls all other functions based on demand
async function main() {
  mainMenu();
  while (true) {
    let choice = await ask("\n Select an option (0-20): ");
    switch (choice) {
      case "0":
        await addProduct();
        break;
      case "1":
        await viewAllProduct();
        break;
      case "2":
        await updateProduct();
        break;
      case "3":
        await deleteProduct();
        break;
      case "4":
        await searchProduct();
        break;
      case "5":
        await saleProduct();
        break;
      case "6":
        await viewSaleHistory();
        break;
      case "7":
        await searchSaleProduct();
        break;
      case "8":
        await addSupplier();
        break;
      case "9":
        await viewAllSupplier();
        break;
      case "10":
        await updateSupplier();
        break;
      case "11":
        await deleteSupplier();
        break;
         case "12":
         await searchSupplier();
         break;
       case "13":
         await refreshProductTable();
         break;
      case "15":
        console.log("Goodbye!");
        process.exit();
      default:
        console.log("Invalid option. Please enter a number between 0 and 20.");
    }
  }
}
// Add Product
async function addProduct() {
  let productName = await ask("Enter Product Name ");
  let productSalePrice = await ask("Enter Product Sale price ");
  let productCostPrice = await ask("Enter Product Cost price ");
  let productQuantity = await ask("Enter Product quantity ");
  let productDescription = await ask("Enter Product description ");
  let productCategory = await ask("Enter Product category ");
  if (
    !productName ||
    !productSalePrice ||
    !productCostPrice ||
    !productQuantity ||
    !productDescription ||
    !productCategory
  ) {
    console.log("Please fill all option ");
    return null;
  }
  await db
    .prepare(
      "INSERT INTO product (name, salePrice, costPrice, quantity, description, category) VALUES (?, ?,?, ?, ?, ?)"
    )
    .run(
      productName.toLowerCase(),
      productSalePrice,
      productCostPrice,
      productQuantity,
      productDescription.toLowerCase(),
      productCategory.toLowerCase()
    );
  console.log("Product added successfully!");
}
// View All Product
async function viewAllProduct() {
  const viewAllProduct = db
    .prepare("SELECT * FROM product Where quantity > 0")
    .all();
  console.table(viewAllProduct);
  return viewAllProduct;
}
// Update Product
async function updateProduct() {
  try {
    var productTable = await viewAllProduct();
    if (productTable.length == 0) {
      return null;
    }
    let updateProductId = await ask("Enter Product Id ");
    const selectedId = await db
      .prepare("SELECT * FROM product Where id = ?")
      .get(updateProductId);
    if (!updateProductId || !selectedId || selectedId.quantity == 0) {
      console.log("Invalid information");
      return null;
    }
    let name = await ask("Enter Product Name ");
    let salePrice = await ask("Enter Product Sale price ");
    let costPrice = await ask("Enter Product Cost price ");
    let quantity = await ask("Enter Product quantity ");
    let description = await ask("Enter Product discription ");
    let category = await ask("Enter Product category ");
    if (
      !name ||
      !salePrice ||
      !costPrice ||
      !quantity ||
      !description ||
      !category
    ) {
      console.log("Please fill all option ");
      return null;
    }
    const updateProduct = db.prepare(
      "UPDATE product SET name = ?, salePrice = ?,costPrice = ?, quantity = ?, description = ?, category = ? WHERE id = ?"
    );
    updateProduct.run(
      name,
      salePrice,
      costPrice,
      quantity,
      description,
      category,
      updateProductId
    );
    console.log("Updated successfully");
  } catch (error) {
    console.log(error.message);
  }
}
// Delete Product
async function deleteProduct() {
  const productTable = await viewAllProduct();
  if (productTable.length > 0) {
    try {
      let id = await ask("Enter Product  Id for deleting ");
      const selectedId = await db
        .prepare("SELECT * FROM product Where id = ?")
        .get(id);
      if (!selectedId || selectedId.quantity === 0) {
        console.log("Invalid id");
        return null;
      }

      const result = await db
        .prepare("DELETE FROM product WHERE id = ?")
        .run(id);
      if (result.changes === 1) {
        console.log(`successfully deleted id number ${id}`);
      } else {
        console.log(id + " Invalid id");
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}
// Search Product
async function searchProduct() {
  let searchProduct = await ask("Please Enter Search option Id/Name/Category ");
  if (searchProduct.toLowerCase() === "name") {
    let name = await ask("Please Enter name ");
    const searchItems = db
      .prepare("SELECT * FROM product Where name = ?")
      .all(name);
    console.table(searchItems);
  } else if (searchProduct.toLowerCase() === "id") {
    let id = await ask("Please Enter id ");
    const searchItems = db
      .prepare("SELECT * FROM product Where id = ?")
      .all(id);
    console.table(searchItems);
  } else if (searchProduct.toLowerCase() === "category") {
    let category = await ask("Please Enter category ");
    const searchItems = db
      .prepare("SELECT * FROM product Where category = ?")
      .all(category);
    console.table(searchItems);
  } else {
    console.log("Please enter correct option");
  }
}
// sale Product
async function saleProduct() {
  try {
    const productTable = await viewAllProduct();
    if (productTable.length > 0) {
      let customerName = await ask("Enter Customer Name ");
      let id = await ask("Enter Product Id for selling ");
      if (!customerName || !id) {
        console.log("Please fill all option");
        return null;
      }
      let result = await db
        .prepare("SELECT * FROM product WHERE id = ?")
        .get(id);
      if (!result) {
        console.log("Invalid information");
        return null;
      }
      let name = result?.name;
      let costPrice = result?.costPrice;
      let salePrice = result?.salePrice;
      let description = result?.description;
      let productQuantity = result?.quantity;
      let category = result?.category;
      let quantity = await ask("Enter quanity ");
      var newQuantity = productQuantity - parseInt(quantity);
      var profit = parseInt(salePrice) - parseInt(costPrice);
      profit = profit * quantity;
      if (parseInt(quantity) > productQuantity) {
        console.log("You don't have enough items");
        return null;
      }
      await db
        .prepare("UPDATE product SET quantity = ? WHERE id = ?")
        .run(newQuantity, id);
      var totalPrice = parseInt(quantity) * salePrice;
      var discount = 0;
      var taxes = 0;

      if (totalPrice > 100) {
        discount = totalPrice * 0.04;
        totalPrice = totalPrice - discount;
        console.log(
          "your total Price " + totalPrice + " (including discount 4%)"
        );
      }
      if (totalPrice < 100) {
        taxes = totalPrice * 0.04;
        totalPrice = totalPrice + taxes;
        console.log("your total Price " + totalPrice + " (including tax 4%)");
      }
      insertSaleItem(
        id,
        name,
        profit,
        customerName,
        description,
        category,
        salePrice,
        quantity,
        totalPrice,
        discount,
        taxes
      );
    }
  } catch (error) {
    console.log(error.message);
  }
}
// Insert sold product into the database
async function insertSaleItem(
  id,
  name,
  profit,
  customerName,
  description,
  category,
  salePrice,
  quantity,
  totalPrice,
  discount,
  taxes
) {
  await db
    .prepare(
      `
    INSERT INTO sale (productId, productName, customerName, salePrice, totalPrice, quantity, description, category , profit , discount, taxes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      id,
      name,
      customerName,
      salePrice,
      totalPrice,
      quantity,
      description,
      category,
      profit,
      discount,
      taxes
    );
}
// sale history
async function viewSaleHistory() {
  const viewSaleItems = db.prepare("SELECT * FROM sale").all();
  console.table(viewSaleItems);
}
// Search Sale Product
async function searchSaleProduct() {
  let searchProduct = await ask("Please Enter Search option Name/Date ");

  if (searchProduct.toLowerCase() === "name") {
    let name = await ask("Please Enter customer name ");
    const searchSaleItems = db
      .prepare("SELECT * FROM sale WHERE customerName LIKE ?")
      .all(`%${name}%`);
    console.table(searchSaleItems);
  } else if (searchProduct.toLowerCase() === "date") {
    let date = await ask("Please Enter date (DD/MM/YYYY) ");

    // Convert DD/MM/YYYY to YYYY-MM-DD format
    const dateParts = date.split("/");
    if (dateParts.length === 3) {
      const day = dateParts[0].padStart(2, "0");
      const month = dateParts[1].padStart(2, "0");
      const year = dateParts[2];
      const formattedDate = `${year}-${month}-${day}`;

      const searchSaleItems = db
        .prepare("SELECT * FROM sale WHERE DATE(createdAt) = DATE(?)")
        .all(formattedDate);
      console.table(searchSaleItems);
    } else {
      console.log("Please enter date in correct format (DD/MM/YYYY)");
    }
  } else {
    console.log("Please enter correct option");
  }
}
// add  Supplier
async function addSupplier() {
  const name = await ask("Enter supplier's Name: ");
  const companyName = await ask("Enter Company Name: ");
  const email = await ask("Enter Email: ");
  const phoneNumber = await ask("Enter Phone Number: ");
  const address = await ask("Enter Address: ");
  const details = await ask("Enter Additional Details: ");
  if (!name || !companyName || !email || !phoneNumber || !address || !details) {
    console.log("Please fill all option");
    return null;
  }
  await db
    .prepare(
      `INSERT INTO supplier 
      (name, companyName, email, phoneNumber, address, details)
      VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(name, companyName, email, phoneNumber, address, details);

  console.log("Supplier added Successfuly");
}
// View All Supplier
async function viewAllSupplier() {
  const veiwAllSupplier = db.prepare("SELECT * FROM supplier").all();
  console.table(veiwAllSupplier);
  return veiwAllSupplier;
}
//update Supplier
async function updateSupplier() {
  const supplierList = await viewAllSupplier();
  if (supplierList.length === 0) {
    console.log("No suppliers found to update.");
    return;
  }
  const id = await ask("Enter the ID of the supplier you want to update: ");
  const selectedId = await db
    .prepare("SELECT * FROM supplier Where id = ?")
    .all(id);
  if (!id || selectedId.length == 0) {
    console.log("Invalid supplier information.");
    return null;
  }
  const name = await ask("Please Enter  Name: ");
  const companyName = await ask(`Enter Company Name `);
  const email = await ask("Enter Email ");
  const phoneNumber = await ask("Enter Phone Number ");
  const address = await ask("Please Enter Address ");
  const details = await ask("Please Enter Details ");
  if (!name || !phoneNumber || !address || !details) {
    console.log("please fill name phnoeNumber address and details");
    return null;
  }
  await db
    .prepare(
      `UPDATE supplier SET 
        name = ?, 
        companyName = ?, 
        email = ?, 
        phoneNumber = ?, 
        address = ?, 
        details = ? 
      WHERE id = ?`
    )
    .run(name, companyName, email, phoneNumber, address, details, id);

  console.log("Supplier updated successfully!");
}
// delete Supplier
async function deleteSupplier() {
  const supplierTable = await viewAllSupplier();
  if (supplierTable.length > 0) {
    try {
      let id = await ask("Enter supplier  Id for deleting ");
      const selectedId = await db
        .prepare("SELECT * FROM supplier Where id = ?")
        .get(id);
      if (!id || !selectedId) {
        console.log("Invalid information");
        return null;
      }

      const result = await db
        .prepare("DELETE FROM supplier WHERE id = ?")
        .run(id);
      if (result.changes === 1) {
        console.log(`successfully deleted id number ${id}`);
      } else {
        console.log(id + " Invalid id");
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}
// Search Supplier
async function searchSupplier() {
  let searchSupplier = await ask("Please Enter Search option name ");
  if (searchSupplier.toLowerCase() === "name") {
    let name = await ask("Please Enter supplier name ");
    const searchSupplierItems = db
      .prepare("SELECT * FROM supplier WHERE name LIKE ?")
      .all(`%${name}%`);
    console.table(searchSupplierItems);
  } 
  else{
    console.log("Please enter correct option");
  }
}
async function refreshProductTable() {
  await db.prepare("DELETE FROM product WHERE quantity = 0").run();
  console.log("successfully Refresh");
}
main();
