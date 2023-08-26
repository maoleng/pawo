import { useEffect } from 'react'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Avatar from '@mui/joy/Avatar'
import Chip from '@mui/joy/Chip'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'

import useScript from '../../hooks/useScript'
import ProposalsTable from '../../pages/components/ProposalsTable'
import Banner from '../../pages/components/Banner'
import styles from './ProposalsDashboard.module.scss'

const cx = classNames.bind(styles)

function ProposalsDashboard() {
    return (
        <div>
            <Box>
                <Container>
                    <Row>
                        {/* Banner */}
                        <Col xs={12} className={cx('banner-wrapper')}>
                            <Banner title="Your Proposals" />
                        </Col>

                        {/* Work table */}
                        <Col xs={12}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
                                    <Box
                                        component="main"
                                        className="MainContent"
                                        sx={(theme) => ({
                                            px: '24px',
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minWidth: 0,
                                            height: '100dvh',
                                            gap: 1,
                                        })}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                my: 1,
                                                gap: 1,
                                                flexWrap: 'wrap',
                                                '& > *': {
                                                    minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
                                                    flexGrow: 1,
                                                },
                                            }}
                                        >
                                            <Typography level="h1" fontSize="xl4">
                                                Your proposals
                                            </Typography>
                                        </Box>
                                        <ProposalsTable />
                                    </Box>
                                </Box>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Box>
        </div>
    )
}

export default ProposalsDashboard
