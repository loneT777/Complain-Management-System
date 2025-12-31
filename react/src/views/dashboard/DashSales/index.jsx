// React & Hooks
import React, { useState, useEffect } from 'react';

// Material UI Components
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';

// Material UI Icons
import {
  PendingActions as PendingIcon,
  CheckCircle as CheckedIcon,
  Forward as ForwardIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// External Libraries
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Chart.js Registration
ChartJS.register(ArcElement, Tooltip, Legend);

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = {
  pending: '#5e72e4',
  assigned: '#11cdef',
  ongoing: '#fb6340',
  completed: '#2dce89',
  highPriority: '#f5365c',
  mediumPriority: '#fb6340',
  lowPriority: '#2dce89',
};

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        font: { size: 11 },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    }
  }
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatusCard = ({ icon: Icon, count, label, borderColor, iconColor }) => (
  <Card 
    sx={{ 
      borderLeft: `4px solid ${borderColor}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Box 
        sx={{ 
          backgroundColor: `${iconColor}15`,
          borderRadius: '8px',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon sx={{ fontSize: 32, color: iconColor }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashSales() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_complaints: 0,
    status_breakdown: {},
    priority_breakdown: {},
    recent_complaints: 0,
    channel_breakdown: {}
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    fetchStatistics();
  }, []);

  // ============================================================================
  // API CALLS
  // ============================================================================
  
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/complaints/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CHART DATA PREPARATION
  // ============================================================================
  
  const statusChartData = {
    labels: ['Pending', 'Assigned', 'Ongoing', 'Completed'],
    datasets: [{
      data: [
        statistics.status_breakdown?.Pending || 0,
        statistics.status_breakdown?.Assigned || 0,
        statistics.status_breakdown?.Ongoing || statistics.status_breakdown?.['In Progress'] || 0,
        statistics.status_breakdown?.Completed || statistics.status_breakdown?.Resolved || statistics.status_breakdown?.Closed || 0
      ],
      backgroundColor: [
        CHART_COLORS.pending,
        CHART_COLORS.assigned,
        CHART_COLORS.ongoing,
        CHART_COLORS.completed
      ],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const priorityChartData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      data: [
        statistics.priority_breakdown?.high || 0,
        statistics.priority_breakdown?.medium || 0,
        statistics.priority_breakdown?.low || 0
      ],
      backgroundColor: [
        CHART_COLORS.highPriority,
        CHART_COLORS.mediumPriority,
        CHART_COLORS.lowPriority
      ],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* ========================================================================== */}
      {/* BREADCRUMB NAVIGATION */}
      {/* ========================================================================== */}
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: '#666', cursor: 'pointer' }}>
          Home
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          ›
        </Typography>
        <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
          Dashboard
        </Typography>
      </Box>

      {/* ========================================================================== */}
      {/* PAGE HEADER */}
      {/* ========================================================================== */}
      
      <Typography variant="h5" fontWeight={600} mb={4}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* ====================================================================== */}
        {/* COMPLAINT APPLICATION DETAILS - FULL WIDTH */}
        {/* ====================================================================== */}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="text.primary">
              Complaint Application Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={PendingIcon}
                  count={statistics.status_breakdown?.Pending || 0}
                  label="Pending"
                  borderColor={CHART_COLORS.pending}
                  iconColor={CHART_COLORS.pending}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.status_breakdown?.Assigned || 0}
                  label="Assigned"
                  borderColor={CHART_COLORS.assigned}
                  iconColor={CHART_COLORS.assigned}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={ForwardIcon}
                  count={statistics.status_breakdown?.Ongoing || statistics.status_breakdown?.['In Progress'] || 0}
                  label="Ongoing"
                  borderColor={CHART_COLORS.ongoing}
                  iconColor={CHART_COLORS.ongoing}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={CheckedIcon}
                  count={statistics.status_breakdown?.Completed || statistics.status_breakdown?.Resolved || statistics.status_breakdown?.Closed || 0}
                  label="Completed"
                  borderColor={CHART_COLORS.completed}
                  iconColor={CHART_COLORS.completed}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ====================================================================== */}
        {/* PRIORITY LEVEL DETAILS - FULL WIDTH */}
        {/* ====================================================================== */}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="text.primary">
              Priority Level Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.priority_breakdown?.high || 0}
                  label="High Priority"
                  borderColor={CHART_COLORS.highPriority}
                  iconColor={CHART_COLORS.highPriority}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.priority_breakdown?.medium || 0}
                  label="Medium Priority"
                  borderColor={CHART_COLORS.mediumPriority}
                  iconColor={CHART_COLORS.mediumPriority}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.priority_breakdown?.low || 0}
                  label="Low Priority"
                  borderColor={CHART_COLORS.lowPriority}
                  iconColor={CHART_COLORS.lowPriority}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.total_complaints}
                  label="Total Applications"
                  borderColor={CHART_COLORS.pending}
                  iconColor={CHART_COLORS.pending}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ====================================================================== */}
        {/* CHARTS ROW - SIDE BY SIDE */}
        {/* ====================================================================== */}
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="text.primary">
              Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <Box sx={{ maxWidth: 300, width: '100%' }}>
                <Pie data={statusChartData} options={CHART_OPTIONS} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="text.primary">
              Priority Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <Box sx={{ maxWidth: 300, width: '100%' }}>
                <Pie data={priorityChartData} options={CHART_OPTIONS} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
