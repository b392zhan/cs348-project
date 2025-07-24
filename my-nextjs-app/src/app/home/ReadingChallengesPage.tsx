// components/ReadingChallengesPage.tsx
"use client";
import { useEffect, useState } from "react";

interface Challenge {
  completed: boolean;
  progress: number;
}

interface Challenges {
  read_12_books_this_year: Challenge;
  read_3_books_by_same_author: Challenge;
  read_5000_pages: Challenge;
}

const ReadingChallengesPage = () => {
  const [challenges, setChallenges] = useState<Challenges | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      const userId = localStorage.getItem("user_id");
      const res = await fetch(`http://localhost:5000/api/reading_challenges?user_id=${userId}`);
      const data = await res.json();
      if (data.status === "success") {
        setChallenges(data.challenges);
      }
    };

    fetchChallenges();
  }, []);

  if (!challenges) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f0f8ff',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }}></div>
            <p style={{ color: '#666', margin: 0 }}>Loading reading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  const challengeList = [
    {
      key: 'read_12_books_this_year',
      title: 'Read 12 books this year',
      data: challenges.read_12_books_this_year,
      target: 12,
      icon: '📚'
    },
    {
      key: 'read_3_books_by_same_author',
      title: 'Read 3 books by the same author',
      data: challenges.read_3_books_by_same_author,
      target: 3,
      icon: '👤'
    },
    {
      key: 'read_5000_pages',
      title: 'Read books totaling 5000+ pages',
      data: challenges.read_5000_pages,
      target: 5000,
      icon: '📖'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f8ff',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1565c0',
            margin: '0 0 8px 0'
          }}>
            📚 Reading Challenges
          </h1>
          <p style={{
            color: '#1976d2',
            fontSize: '16px',
            margin: 0
          }}>
            Track your reading progress and achievements
          </p>
        </div>

        {/* Challenge Cards */}
        <div style={{ marginBottom: '32px' }}>
          {challengeList.map((challenge, index) => {
            const progressPercentage = Math.min((challenge.data.progress / challenge.target) * 100, 100);
            
            return (
              <div
                key={challenge.key}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '24px',
                  marginBottom: '24px',
                  borderLeft: `6px solid ${challenge.data.completed ? '#4caf50' : '#1976d2'}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>{challenge.icon}</span>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#333',
                      margin: 0
                    }}>
                      {challenge.title}
                    </h3>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>
                      {challenge.data.completed ? "✅" : "⏳"}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: challenge.data.completed ? '#e8f5e8' : '#e3f2fd',
                      color: challenge.data.completed ? '#2e7d32' : '#1976d2'
                    }}>
                      {challenge.data.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    <span>Progress</span>
                    <span>{challenge.data.progress} / {challenge.target}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '10px',
                    height: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: challenge.data.completed ? '#4caf50' : '#1976d2',
                      width: `${progressPercentage}%`,
                      transition: 'width 0.5s ease-in-out',
                      borderRadius: '10px'
                    }}></div>
                  </div>
                  <div style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    {progressPercentage.toFixed(0)}% complete
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '16px',
            textAlign: 'center',
            margin: '0 0 16px 0'
          }}>
            Challenge Summary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1976d2',
                marginBottom: '4px'
              }}>
                {challengeList.filter(c => c.data.completed).length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                Completed
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#fff3e0',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#f57c00',
                marginBottom: '4px'
              }}>
                {challengeList.filter(c => !c.data.completed && c.data.progress > 0).length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                In Progress
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#666',
                marginBottom: '4px'
              }}>
                {challengeList.filter(c => c.data.progress === 0).length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                Not Started
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReadingChallengesPage;