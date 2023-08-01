import { Fragment, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardActions from '@mui/joy/CardActions'
import CardContent from '@mui/joy/CardContent'
import Divider from '@mui/joy/Divider'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Textarea from '@mui/joy/Textarea'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Avatar from '@mui/joy/Avatar'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { DeleteRegular } from '@fluentui/react-icons'

import { WalletContext } from '../../App'
import Banner from '../../pages/components/Banner'
import ModalAlert from '../../pages/components/ModalAlert'
import config from '../../config'
import styles from './CreateWork.module.scss'

const cx = classNames.bind(styles)

function CreateWork() {
    const { contractId, wallet } = useContext(WalletContext)
    const [currency, setCurrency] = useState('dollar')
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [openUpdateModal, setOpenUpdateModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const { state } = useLocation()

    const createWorkHandler = (e) => {
        e.preventDefault()
        const { workTitle, workCategory, workDesc, workDue, workBudget } = e.target.elements

        wallet
            .callMethod({
                method: 'CreateJob',
                args: {
                    title: workTitle.value,
                    description: workDesc.value,
                    categories: [workCategory.value],
                    money: workBudget.value,
                },
                contractId,
            })
            .then(async (res) => {
                console.log(res)
                setOpenCreateModal(true)
            })
    }

    const updateWorkHandler = (e) => {
        console.log(state?.work?.id)
        e.preventDefault()
        const { workTitleUpdate, workDescUpdate, workDueUpdate, workBudgetUpdate } = e.target.elements

        wallet
            .callMethod({
                method: 'UpdateJob',
                args: {
                    id: state?.work?.id,
                    title: workTitleUpdate.value,
                    description: workDescUpdate.value,
                    categories: [...state?.work?.categories],
                    money: workBudgetUpdate.value,
                },
                contractId,
            })
            .then(async (res) => {
                console.log(res)
                setOpenUpdateModal(true)
            })
    }

    const deleteWorkHandler = (e) => {
        console.log(state?.work?.id)
        e.preventDefault()

        wallet
            .callMethod({
                method: 'DeleteJob',
                args: {
                    id: state?.work?.id,
                },
                contractId,
            })
            .then(async (res) => {
                console.log(res)
                setOpenDeleteModal(true)
            })
    }

    return (
        <div>
            <Box>
                <Container>
                    <Row>
                        {/* Banner */}
                        <Col xs={12} className={cx('banner-wrapper')}>
                            <Banner title="Post New Work" />
                        </Col>

                        {/* Create job form */}
                        <Col xs={12} lg={8}>
                            {state?.type === 'create' ? (
                                <Card
                                    variant="outlined"
                                    sx={{
                                        maxHeight: 'max-content',
                                        maxWidth: '100%',
                                        mx: 'auto',
                                        px: '40px',
                                        py: '32px',
                                    }}
                                >
                                    <h3 className={cx('form-title')}>About the work</h3>
                                    <Divider insert="none" />
                                    <form onSubmit={createWorkHandler}>
                                        <CardContent
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, minmax(80px, 1fr))',
                                                gap: 1.5,
                                            }}
                                        >
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel sx={{ my: '12px' }}>
                                                    Give your project brief a title
                                                </FormLabel>
                                                <Input
                                                    slotProps={{
                                                        input: {
                                                            name: 'workTitle',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your work's category?</FormLabel>
                                                <Input
                                                    slotProps={{
                                                        input: {
                                                            name: 'workCategory',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What are you looking to get done?</FormLabel>
                                                <Textarea
                                                    slotProps={{
                                                        textarea: {
                                                            name: 'workDesc',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your timeline?</FormLabel>
                                                <Input
                                                    type="date"
                                                    slotProps={{
                                                        input: {
                                                            name: 'workDue',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your budget?</FormLabel>
                                                <Input
                                                    placeholder="Amount"
                                                    startDecorator={{ dollar: '$', baht: '฿', yen: '¥' }[currency]}
                                                    endDecorator={
                                                        <Fragment>
                                                            <Divider orientation="vertical" />
                                                            <Select
                                                                variant="plain"
                                                                value={currency}
                                                                onChange={(_, value) => setCurrency(value)}
                                                                sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                                            >
                                                                <Option value="dollar">US dollar</Option>
                                                                <Option value="baht">Thai baht</Option>
                                                                <Option value="yen">Japanese yen</Option>
                                                            </Select>
                                                        </Fragment>
                                                    }
                                                    slotProps={{
                                                        input: {
                                                            name: 'workBudget',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>Attach Files</FormLabel>
                                                <Input
                                                    type="file"
                                                    slotProps={{
                                                        input: {
                                                            name: 'work-attachments',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <CardActions sx={{ gridColumn: '1/-1', my: '24px' }}>
                                                <button
                                                    className="btn rounded-pill btn-primary-style w-100 fw-bold"
                                                    type="submit"
                                                >
                                                    Save and Post
                                                </button>
                                            </CardActions>
                                        </CardContent>
                                    </form>
                                </Card>
                            ) : (
                                <Card
                                    variant="outlined"
                                    sx={{
                                        maxHeight: 'max-content',
                                        maxWidth: '100%',
                                        mx: 'auto',
                                        px: '40px',
                                        py: '32px',
                                    }}
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
                                        <h3 className={cx('form-title')}>Update the work</h3>
                                        <Box sx={{ flex: 999 }} />
                                        <Box sx={{ display: 'flex', gap: 1, '& > *': { flexGrow: 1 } }}>
                                            <form onSubmit={deleteWorkHandler}>
                                                <Button
                                                    variant="outlined"
                                                    size="lg"
                                                    color="danger"
                                                    startDecorator={<DeleteRegular />}
                                                    type="submit"
                                                >
                                                    Delete job
                                                </Button>
                                            </form>
                                        </Box>
                                    </Box>
                                    <Divider insert="none" />
                                    <form onSubmit={updateWorkHandler}>
                                        <CardContent
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, minmax(80px, 1fr))',
                                                gap: 1.5,
                                            }}
                                        >
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel className={cx('fo')} sx={{ my: '12px' }}>
                                                    Give your project brief a title
                                                </FormLabel>
                                                <Input
                                                    slotProps={{
                                                        input: {
                                                            name: 'workTitleUpdate',
                                                            value: state?.work?.title,
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What are you looking to get done?</FormLabel>
                                                <Textarea
                                                    slotProps={{
                                                        input: {
                                                            name: 'workDescUpdate',
                                                            value: state?.work?.description,
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your timeline?</FormLabel>
                                                <Input
                                                    type="date"
                                                    slotProps={{
                                                        input: {
                                                            name: 'workDueUpdate',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your budget?</FormLabel>
                                                <Input
                                                    placeholder="Amount"
                                                    startDecorator={{ dollar: '$', baht: '฿', yen: '¥' }[currency]}
                                                    endDecorator={
                                                        <Fragment>
                                                            <Divider orientation="vertical" />
                                                            <Select
                                                                variant="plain"
                                                                value={currency}
                                                                onChange={(_, value) => setCurrency(value)}
                                                                sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                                            >
                                                                <Option value="dollar">US dollar</Option>
                                                                <Option value="baht">Thai baht</Option>
                                                                <Option value="yen">Japanese yen</Option>
                                                            </Select>
                                                        </Fragment>
                                                    }
                                                    slotProps={{
                                                        input: {
                                                            name: 'workBudgetUpdate',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>Attach Files</FormLabel>
                                                <Input
                                                    type="file"
                                                    slotProps={{
                                                        input: {
                                                            name: 'workAttachmentsUpdate',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <CardActions sx={{ gridColumn: '1/-1', my: '24px' }}>
                                                <button
                                                    className="btn rounded-pill btn-primary-style w-100 fw-bold"
                                                    type="submit"
                                                >
                                                    Update work
                                                </button>
                                            </CardActions>
                                        </CardContent>
                                    </form>
                                </Card>
                            )}
                        </Col>
                        <Col xs={12} lg={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                }}
                            >
                                <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                                    <Avatar src="/static/images/avatar/1.jpg" sx={{ '--Avatar-size': '4rem' }} />
                                    <Chip
                                        size="sm"
                                        variant="soft"
                                        color="primary"
                                        sx={{ mt: -1, border: '3px solid', borderColor: 'background.surface' }}
                                    >
                                        PRO
                                    </Chip>
                                    <Typography fontSize="lg" fontWeight="lg" sx={{ mt: 1, mb: 0.5 }}>
                                        Tien Le
                                    </Typography>
                                    <Typography level="body2" sx={{ maxWidth: '24ch' }}>
                                        Hello, this is my bio and I am a PRO member of Freelance dApp. I am a developer
                                        and I love to code.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Box>
            <ModalAlert
                open={openCreateModal}
                setOpen={setOpenCreateModal}
                message="You've posted new work successfully. Be patient to wait potential clients."
                backPath={config.routes.workDashboard}
            />
            <ModalAlert
                open={openUpdateModal}
                setOpen={setOpenUpdateModal}
                title="Update Successfully"
                message="You've updated your work successfully. Be patient to wait potential clients."
                backPath={config.routes.workDashboard}
            />
            <ModalAlert
                open={openDeleteModal}
                setOpen={setOpenDeleteModal}
                title="Update Successfully"
                message="You've just deleted your work. Hope to see your new work soon."
                backPath={config.routes.workDashboard}
            />
        </div>
    )
}

export default CreateWork
