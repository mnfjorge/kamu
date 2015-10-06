var LibrarySelect, Login;

LibrarySelect = require('../../page_objects/library_select');
Login = require('../../page_objects/login');
testData = require('../../utils/test_data');

describe('a user browsing the library', function () {
  var librarySelect, bookList, login;

  beforeEach(function (done) {
    login = new Login();
    login.login('John Doe');
    librarySelect = new LibrarySelect();
    testData.setupLibrary(function (err, response) {
      testData.setupBook(response.headers.location, done);
    });
  });

  afterEach(function (done) {
    testData.cleanUpCopies(function () {
      testData.cleanUpLibrary(done);
    });
  });

  it('should be able to borrow a book', function () {
    bookList = librarySelect.visit().select('test');

    var book = bookList.books.first();

    bookList.borrow(book);

    expect(bookList.isBorrowed(book)).toBe(true);
  });
});