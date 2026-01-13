# TODO: Remove Email Requirement in User Creation

## Tasks
- [x] Update validation in UserController.php store method to make email nullable
- [x] Modify person creation logic to always create new person instead of firstOrCreate
- [x] Update user creation to set email to null if not provided
- [x] Adjust username generation to handle cases without email
