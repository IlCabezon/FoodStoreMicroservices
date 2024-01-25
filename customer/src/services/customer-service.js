const { CustomerRepository } = require("../database");
const {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");
const { NotFoundError, ValidationError } = require("../utils/app-errors");

// All Business logic will be here
class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    const existingCustomer = await this.repository.FindCustomer({ email });
    if (!existingCustomer) {
      throw new NotFoundError("user not found with provided email");
    }

    const validPassword = await ValidatePassword(
      password,
      existingCustomer.password,
      existingCustomer.salt
    );

    if (!validPassword) {
      throw new ValidationError("password doesn't match!");
    }
    const token = await GenerateSignature({
      email: existingCustomer.email,
      _id: existingCustomer._id,
    });
    return { id: existingCustomer._id, token };
  }

  async SignUp(userInputs) {
    const { email, password, phone } = userInputs;

    try {
      // create salt
      let salt = await GenerateSalt();

      let userPassword = await GeneratePassword(password, salt);

      const existingCustomer = await this.repository.CreateCustomer({
        email,
        password: userPassword,
        phone,
        salt,
      });

      const token = await GenerateSignature({
        email: email,
        _id: existingCustomer._id,
      });

      return { id: existingCustomer._id, token };
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async AddNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;

    return this.repository.CreateAddress({
      _id,
      street,
      postalCode,
      city,
      country,
    });
  }

  async GetProfile(id) {
    return this.repository.FindCustomerById({ id });
  }

  async DeleteProfile(id) {
    const deletedCustomer = await this.repository.DeleteCustomerByid({ id });
    const payload = {
      event: "DELETE_PROFILE",
      data: { id },
    };

    return { data: deletedCustomer, payload };
  }
}

module.exports = CustomerService;
