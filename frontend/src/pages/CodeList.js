import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CodeList = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await axios.get('http://localhost:8000/coding/get_allCodes');
        // Ensure res.data is an array; adjust based on actual backend response
        const data = Array.isArray(res.data) ? res.data : res.data.codes || [];
        setCodes(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching codes:', err);
        setError('Failed to load coding problems. Please try again later.');
        setLoading(false);
      }
    };
    fetchCodes();
  }, []);

  const handleCardClick = (codeId) => {
    navigate(`/compiler/${codeId}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        📘 Select a Coding Problem
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && codes.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No coding problems available.
        </Typography>
      )}

      <Grid container spacing={3}>
        {codes.map((code) => (
          <Grid item xs={12} sm={6} md={4} key={code.code_id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
              <CardActionArea onClick={() => handleCardClick(code.code_id)}>
                <CardContent>
                  {/* Problem Title */}
                  <Typography variant="h6" gutterBottom>
                    {code.code_title || 'Untitled Problem'}
                  </Typography>

                  {/* Problem Statement */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {code.code_problem_statement
                      ? code.code_problem_statement.substring(0, 100) + (code.code_problem_statement.length > 100 ? '...' : '')
                      : 'No description available'}
                  </Typography>

                  {/* Difficulty */}
                  {code.code_difficulty && (
                    <Chip
                      label={code.code_difficulty}
                      size="small"
                      color={
                        code.code_difficulty === 'Easy'
                          ? 'success'
                          : code.code_difficulty === 'Medium'
                          ? 'warning'
                          : 'error'
                      }
                      sx={{ mb: 1 }}
                    />
                  )}

                  {/* Tags */}
                  {code.code_tags?.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {code.code_tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CodeList;