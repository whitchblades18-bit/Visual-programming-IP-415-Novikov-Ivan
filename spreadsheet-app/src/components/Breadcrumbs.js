import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Breadcrumbs.css';

function Breadcrumbs() {
  const location = useLocation();
  const { documentId } = useParams();
  const { list: documents } = useSelector((state) => state.documents);
  
  const getDocumentName = () => {
    const doc = documents.find(d => d.id === documentId);
    return doc ? doc.name : 'Документ';
  };
  
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    if (pathnames.length === 0) return [{ name: 'Главная', path: '/' }];
    
    const breadcrumbs = [{ name: 'Главная', path: '/' }];
    
    for (let i = 0; i < pathnames.length; i++) {
      const pathname = pathnames[i];
      const path = `/${pathnames.slice(0, i + 1).join('/')}`;
      
      if (pathname === 'documents' && pathnames[i + 1]) {
        breadcrumbs.push({ name: 'Мои документы', path: '/dashboard' });
        breadcrumbs.push({ name: getDocumentName(), path });
        break;
      } else if (pathname === 'dashboard') {
        breadcrumbs.push({ name: 'Мои документы', path });
      } else if (pathname === 'profile') {
        breadcrumbs.push({ name: 'Профиль', path });
      }
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  return (
    <div className="breadcrumbs">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && <span className="separator">→</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="current">{crumb.name}</span>
          ) : (
            <Link to={crumb.path} className="breadcrumb-link">
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumbs;