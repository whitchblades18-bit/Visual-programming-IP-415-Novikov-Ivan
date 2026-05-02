import React, { useEffect, useState } from 'react';

const BookCover = ({ title, isbn }) => {
  const [imgError, setImgError] = useState(false);
  
  // Заменил исходную ссылку на ссылку Open Library API!
  ///////////////////////////////////////////////////////////////////////////////////////////////
  const getCoverUrl = () => {
    if (isbn) {
      return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }
    return null;
  };

  const coverUrl = getCoverUrl();
  
  const colors = ['#d7d7d7'];
  const colorIndex = (title?.charCodeAt(0) || 0) % colors.length;

  if (coverUrl===false || imgError) {
    return (
      <div style={{
        width: '100%',
        height: '240px',
        backgroundColor: colors[colorIndex],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        fontWeight: 'bold',
        color: 'white'
      }}>
        {title?.charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img 
      src={coverUrl} 
      alt={title} 
      style={{
        width: '100%',
        height: '240px',
        objectFit: 'cover'
      }}
      onError={() => setImgError(true)}
    />
  );
};

const App = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('https://fakeapi.extendsclass.com/books')
      .then(response => response.json())
      .then(data => {
        setBooks(data);
      });
  }, []);

  return (
    <div style={{maxWidth: '1400px', margin: '0 auto', padding: '20px'}}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {books.map((book) => (
          <article key={book.id} style={{
            backgroundColor: 'white',
            // borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <BookCover title={book.title} isbn={book.isbn} />
            
            <div style={{padding: '20px'}}>
              <h2 style={{
                marginTop: 0,
                marginBottom: '12px',
                fontSize: '1.25rem',
                color: '#2c3e50'
              }}>
                {book.title}
              </h2>
              
              <p><strong>Авторы:</strong> {book.authors?.filter(a => a?.trim()).join(', ') || 'Не указаны'}</p>
              <p><strong>Страниц:</strong> {book.pageCount || 'Нет данных'}</p>
              <p><strong>ISBN:</strong> {book.isbn || 'Не указан'}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default App;