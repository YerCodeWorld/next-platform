// apps/home/src/pages/DynamicsPage.tsx
// THIS IS THE PREVIOUS LANDING PAGE WE HAD, IT IS VERY INCONSISTENT IN THE SENSE THAT
// CODEBASE CONTEXT WAS TOTALLY DIFFERENT.
// YOU MIGHT SEE IT JUST AS A DIM EXAMPLE, TAKING COMPONENTS LIKE THE DYNAMIC CARD OR FILTERS.

import { useEffect, useState } from 'react';  // useMemo ??
import { Link } from "next-link";
import { HelmetProvider } from 'react-helmet-async';

import { useDynamicsApi, Dynamic, type DynamicsFilters } from '@repo/api-bridge';
import '../styles/pages/dynamicsPage.css';

// Dynamic card component
const DynamicCard = ({ dynamic, isCurrentUserAuthor }: { dynamic: Dynamic, isCurrentUserAuthor: boolean }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER': return '#28a745';
            case 'INTERMEDIATE': return '#ffc107';
            case 'ADVANCED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const formatAgeGroup = (ageGroup: string) => {
        switch (ageGroup) {
            case 'KIDS': return 'Kids (5-12)';
            case 'TEENS': return 'Teens (13-17)';
            case 'ADULTS': return 'Adults (18+)';
            case 'ALL_AGES': return 'All Ages';
            default: return ageGroup;
        }
    };

    const formatDynamicType = (type: string) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <article className="dynamic-card">
            {isCurrentUserAuthor && (
                <Link to={`/dynamics/editor/edit/${dynamic.slug}`} className="edit-dynamic-button">
                    Edit
                </Link>
            )}

            <div className="dynamic-header">
                <div className="dynamic-meta">
                    <span className="dynamic-type">{formatDynamicType(dynamic.dynamicType)}</span>
                    <span
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(dynamic.difficulty) }}
                    >
                        {dynamic.difficulty}
                    </span>
                </div>
                <h2><Link to={`/dynamics/${dynamic.slug}`}>{dynamic.title}</Link></h2>
                <p className="dynamic-objective">{dynamic.objective}</p>
            </div>

            <div className="dynamic-details">
                <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>{dynamic.duration} min</span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>
                        {dynamic.minStudents}
                        {dynamic.maxStudents ? `-${dynamic.maxStudents}` : '+'} students
                    </span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-child"></i>
                    <span>{formatAgeGroup(dynamic.ageGroup)}</span>
                </div>
            </div>

            <p className="dynamic-description">{dynamic.description}</p>

            {dynamic.materialsNeeded && (
                <div className="materials-needed">
                    <strong>Materials:</strong> {dynamic.materialsNeeded}
                </div>
            )}

            <footer className="dynamic-footer">
                <div className="author-info">
                    <img
                        src={dynamic.user?.picture || '/images/default-avatar.png'}
                        alt={dynamic.user?.name || 'Author'}
                        className="author-avatar"
                    />
                    <div>
                        <span className="author-name">{dynamic.user?.name}</span>
                        <time className="publish-date">{formatDate(dynamic.createdAt)}</time>
                    </div>
                </div>
                <Link to={`/dynamics/${dynamic.slug}`} className="read-more-btn">
                    View Dynamic
                </Link>
            </footer>
        </article>
    );
};

// Filters component
const DynamicsFilters = ({ filters, onFilterChange, onClearFilters }: {
    filters: DynamicsFilters;
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
}) => {
    return (
        <div className="dynamics-filters">
            <h3>Filter Dynamics</h3>

            <div className="filter-group">
                <label htmlFor="dynamicType">Type:</label>
                <select
                    id="dynamicType"
                    value={filters.dynamicType || ''}
                    onChange={(e) => onFilterChange('dynamicType', e.target.value || undefined)}
                >
                    <option value="">All Types</option>
                    <option value="READING">Reading</option>
                    <option value="CONVERSATION">Conversation</option>
                    <option value="TEACHING_STRATEGY">Teaching Strategy</option>
                    <option value="GRAMMAR">Grammar</option>
                    <option value="VOCABULARY">Vocabulary</option>
                    <option value="GAME">Game</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="GENERAL">General</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="ageGroup">Age Group:</label>
                <select
                    id="ageGroup"
                    value={filters.ageGroup || ''}
                    onChange={(e) => onFilterChange('ageGroup', e.target.value || undefined)}
                >
                    <option value="">All Ages</option>
                    <option value="KIDS">Kids (5-12)</option>
                    <option value="TEENS">Teens (13-17)</option>
                    <option value="ADULTS">Adults (18+)</option>
                    <option value="ALL_AGES">All Ages</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="difficulty">Difficulty:</label>
                <select
                    id="difficulty"
                    value={filters.difficulty || ''}
                    onChange={(e) => onFilterChange('difficulty', e.target.value || undefined)}
                >
                    <option value="">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Duration (minutes):</label>
                <div className="duration-filters">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minDuration || ''}
                        onChange={(e) => onFilterChange('minDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <span>to</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxDuration || ''}
                        onChange={(e) => onFilterChange('maxDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                </div>
            </div>

            <button onClick={onClearFilters} className="clear-filters-btn">
                Clear Filters
            </button>
        </div>
    );
};

// Main DynamicsPage component
const DynamicsPage = () => {
    // const { t } = useI18n();
    const { isAuthenticated, user } = useAuth();  // would need to replace things like this for example
    const dynamicsApi = useDynamicsApi();

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [dynamics, setDynamics] = useState<Dynamic[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<DynamicsFilters>({
        published: true,
        limit: 6,
        page: 1,
        orderBy: 'createdAt',
        order: 'desc'
    });

    const dynamicsPerPage = 6;

    // previous object for SEO. You may adapt specific SEO using NextJS capabilities
    const dynamicsSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Teaching Dynamics Collection",
        "description": "Innovative teaching strategies and classroom activities shared by educators",
        "url": seoHelpers.generateCanonical('/dynamics'),
        "numberOfItems": dynamics.length,
        "itemListElement": dynamics.slice(0, 10).map((dynamic, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "LearningResource",
                "name": dynamic.title,
                "description": dynamic.description,
                "url": seoHelpers.generateCanonical(`/dynamics/${dynamic.slug}`)
            }
        }))
    };

    // Check if the current user is the author of a dynamic
    const isCurrentUserAuthor = (dynamic: Dynamic) => {
        return user?.email === dynamic.authorEmail;
    };

    // Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filters change
        }));
        setCurrentPage(1);
    };

    // Clear all filters
    const handleClearFilters = () => {
        setFilters({
            published: true,
            limit: dynamicsPerPage,
            page: 1,
            orderBy: 'createdAt',
            order: 'desc'
        });
        setCurrentPage(1);
    };

    // Fetch dynamics when filters or page changes
    useEffect(() => {
        const fetchDynamics = async () => {
            try {
                setLoading(true);
                const currentFilters = {
                    ...filters,
                    page: currentPage,
                    limit: dynamicsPerPage
                };

                const response = await dynamicsApi.getAllDynamics(currentFilters);

                if (response.data) {
                    setDynamics(response.data as Dynamic[]);
                    // If your API returns pagination info, use it
                    // Otherwise calculate based on returned data

                    setTotalPages(Math.ceil((response.data as Dynamic[]).length / dynamicsPerPage));

                }
            } catch (err) {
                console.error('Error fetching dynamics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDynamics();
    }, [filters, currentPage]);

    // Set page title
    useEffect(() => {
        document.title = 'Teaching Dynamics - EduGuiders';
    }, []);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    if (loading && dynamics.length === 0) {
        return <Loading />;
    }

    return (
        <HelmetProvider>
            <div className="dynamics-page">
                <SEO
                    title="Teaching Dynamics - Innovative Classroom Strategies"
                    description="Discover innovative teaching strategies and classroom activities shared by expert educators. Find creative dynamics for all age groups and difficulty levels."
                    keywords="teaching dynamics, classroom activities, teaching strategies, educational methods, lesson plans, teaching techniques"
                    canonical={seoHelpers.generateCanonical('/dynamics')}

                    ogTitle="Teaching Dynamics - Innovative Educational Strategies"
                    ogDescription="Explore creative teaching methods and classroom activities from expert educators"
                    ogImage={seoHelpers.generateOGImage('Teaching Dynamics', 'dynamic')}

                    schema={dynamicsSchema}
                    alternateLanguages={generateAlternateLanguages('/dynamics')}
                />
                <div className="dynamics-header">
                    <div className="header-content">
                        <h1>Teaching Dynamics</h1>
                        <p>Discover innovative teaching strategies and activities shared by our community of educators</p>

                        {isAuthenticated && (user?.role === "TEACHER" || user?.role === "ADMIN") && (
                            <Link to="/dynamics/editor/new" className="create-dynamic-button">
                                <i className="fas fa-plus"></i>
                                Create New Dynamic
                            </Link>
                        )}
                    </div>
                </div>

                <div className="dynamics-container">
                    <aside className="dynamics-sidebar">
                        <DynamicsFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </aside>

                    <main className="dynamics-main">
                        {loading && (
                            <div className="loading-overlay">
                                <div className="loading-spinner">Loading...</div>
                            </div>
                        )}

                        {dynamics.length === 0 && !loading ? (
                            <div className="no-dynamics">
                                <i className="fas fa-search"></i>
                                <h3>No dynamics found</h3>
                                <p>Try adjusting your filters or be the first to create one!</p>
                                {isAuthenticated && (user?.role === "TEACHER" || user?.role === "ADMIN") && (
                                    <Link to="/dynamics/editor/new" className="create-first-dynamic">
                                        Create the First Dynamic
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="dynamics-grid">
                                    {dynamics.map(dynamic => (
                                        <DynamicCard
                                            key={dynamic.id}
                                            dynamic={dynamic}
                                            isCurrentUserAuthor={isCurrentUserAuthor(dynamic)}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                            Previous
                                        </button>

                                        <span className="page-info">
                                            Page {currentPage} of {totalPages}
                                        </span>

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage >= totalPages}
                                            className={`pagination-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
                                        >
                                            Next
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </HelmetProvider>
    );
};

export default DynamicsPage;