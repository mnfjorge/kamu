import React, { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import InfiniteScroll from 'react-infinite-scroller';
import PropTypes from 'prop-types';
import { getBooksByPage } from '../../services/BookService';
import BookList from '../books/BookList';
import SearchBar from './SearchBar';
import { setRegion } from '../../services/ProfileService';
import ErrorMessage from '../error/ErrorMessage';

class Library extends Component {
  constructor(props) {
    super(props);

    const searchTerm = new URLSearchParams(props.history.location.search).get('q') || '';

    this.state = {
      books: [],
      hasNextPage: true,
      page: 1,
      searchTerm,
      isLoading: false,
      hasError: false,
    };

    this.loadBooks = this.loadBooks.bind(this);
    this.searchTermChanged = this.searchTermChanged.bind(this);
  }

  async loadBooks() {
    if (this.state.isLoading) return;

    this.setState({ isLoading: true, hasNextPage: false });

    const { page, searchTerm } = this.state;

    try {
      const booksResponse = await getBooksByPage(this.props.slug, page, searchTerm);
      setRegion(this.props.slug);
      this.setState((state) => ({
        books: state.books.concat(booksResponse.results),
        page: state.page + 1,
        hasNextPage: !!booksResponse.next,
        isLoading: false,
      }));

      this.props.history.replace({
        search: searchTerm ? new URLSearchParams({ q: searchTerm }).toString() : null,
      });
    } catch (e) {
      this.setState({ hasError: true });
    }
  }

  searchTermChanged(searchTerm) {
    this.setState({
      searchTerm,
      books: [],
      page: 1,
      hasNextPage: false,
    }, () => {
      this.loadBooks();
    });
  }

  render() {
    return this.state.hasError ? <ErrorMessage /> : (
      <React.Fragment>
        <SearchBar onChange={this.searchTermChanged} query={this.state.searchTerm} />
        <InfiniteScroll
          loadMore={this.loadBooks}
          hasMore={this.state.hasNextPage}
          threshold={950}
          loader={(
            <div style={{ padding: 10, textAlign: 'center' }} key="booklist-loader">
              <CircularProgress />
            </div>
          )}
        >
          <BookList books={this.state.books} library={this.props.slug} />
        </InfiniteScroll>
      </React.Fragment>
    );
  }
}

Library.propTypes = {
  slug: PropTypes.string.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Library;
