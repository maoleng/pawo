import { Fragment, useState, useEffect, useContext } from 'react'
import { Link as LinkRoute } from 'react-router-dom'
import format from 'date-fns/format'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Divider from '@mui/joy/Divider'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Link from '@mui/joy/Link'
import Input from '@mui/joy/Input'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import ModalClose from '@mui/joy/ModalClose'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Table from '@mui/joy/Table'
import Sheet from '@mui/joy/Sheet'
import Checkbox from '@mui/joy/Checkbox'
import IconButton from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import {
    ArrowLeftRegular,
    ArrowRightRegular,
    ArrowDownRegular,
    CheckmarkRegular,
    DismissRegular,
    ArrowStepBackRegular,
    EyeRegular,
} from '@fluentui/react-icons'
import { WalletContext } from '../../../App'
import config from '../../../config'
import { axiosInstance } from '../../../utils/axiosInstance'

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1
    }
    if (b[orderBy] > a[orderBy]) {
        return 1
    }
    return 0
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy)
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index])
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0])
        if (order !== 0) {
            return order
        }
        return a[1] - b[1]
    })
    return stabilizedThis.map((el) => el[0])
}

function ProposalsTable() {
    const { contractId, wallet, userId } = useContext(WalletContext)
    const [proposalList, setProposalList] = useState([])
    const [order, setOrder] = useState('desc')
    const [selected, setSelected] = useState([])
    const [openFilter, setOpenFilter] = useState(false)

    useEffect(() => {
        ;(async () => {
            await axiosInstance({
                method: 'GET',
                url: `job_user?_filter=userId:${userId}&_fields=jobId,userId,message,createdAt,jobObj&_noPagination=1`,
            })
                .then((res) => {
                    if (res.data.status) {
                        setProposalList([...res.data.data])
                    }
                    console.log(res)
                })
                .catch((res) => {
                    console.log(res)
                })
        })()
    }, [])

    const renderFilters = () => (
        <Fragment>
            <FormControl size="sm">
                <FormLabel>Status</FormLabel>
                <Select
                    placeholder="Filter by status"
                    slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                    sx={{ py: 0 }}
                >
                    <Option value="paid">Paid</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="refunded">Refunded</Option>
                    <Option value="cancelled">Cancelled</Option>
                </Select>
            </FormControl>

            <FormControl size="sm" sx={{ py: 0 }}>
                <FormLabel>Category</FormLabel>
                <Select placeholder="All">
                    <Option value="all">All</Option>
                </Select>
            </FormControl>

            <FormControl size="sm" sx={{ py: 0 }}>
                <FormLabel>Customer</FormLabel>
                <Select placeholder="All">
                    <Option value="all">All</Option>
                </Select>
            </FormControl>
        </Fragment>
    )

    return (
        <Fragment>
            <Sheet
                className="SearchAndFilters-mobile"
                sx={{
                    display: {
                        xs: 'flex',
                        sm: 'none',
                    },
                    my: 1,
                    gap: 1,
                }}
            >
                <Input
                    size="sm"
                    placeholder="Search"
                    startDecorator={<i data-feather="search" />}
                    sx={{ flexGrow: 1 }}
                />
                <IconButton size="sm" variant="outlined" color="neutral" onClick={() => setOpenFilter(true)}>
                    <i data-feather="filter" />
                </IconButton>
                <Modal open={openFilter} onClose={() => setOpenFilter(false)}>
                    <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
                        <ModalClose />
                        <Typography id="filter-modal" level="h2">
                            Filters
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {renderFilters()}
                            <Button color="primary" onClick={() => setOpenFilter(false)}>
                                Submit
                            </Button>
                        </Sheet>
                    </ModalDialog>
                </Modal>
            </Sheet>
            <Box
                className="SearchAndFilters-tabletUp"
                sx={{
                    borderRadius: 'sm',
                    py: 2,
                    display: {
                        xs: 'none',
                        sm: 'flex',
                    },
                    flexWrap: 'wrap',
                    gap: 1.5,
                    '& > *': {
                        minWidth: {
                            xs: '120px',
                            md: '160px',
                        },
                    },
                }}
            >
                <FormControl sx={{ flex: 1 }} size="sm">
                    <FormLabel>Search for order</FormLabel>
                    <Input placeholder="Search" startDecorator={<i data-feather="search" />} />
                </FormControl>

                {renderFilters()}
            </Box>
            <Sheet
                variant="outlined"
                sx={{
                    width: '100%',
                    borderRadius: 'md',
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                <Table
                    aria-labelledby="tableTitle"
                    stickyHeader
                    hoverRow
                    sx={{
                        '--TableCell-headBackground': (theme) => theme.vars.palette.background.level1,
                        '--Table-headerUnderlineThickness': '1px',
                        '--TableRow-hoverBackground': (theme) => theme.vars.palette.background.level1,
                        fontSize: '1.2rem',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ width: 48, textAlign: 'center', padding: 12 }}>
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length !== proposalList.length}
                                    checked={selected.length === proposalList.length}
                                    onChange={(e) => {
                                        setSelected(
                                            e.target.checked ? proposalList.map((proposal) => proposal.jobObj.id) : [],
                                        )
                                    }}
                                    color={
                                        selected.length > 0 || selected.length === proposalList.length
                                            ? 'primary'
                                            : undefined
                                    }
                                    sx={{ verticalAlign: 'text-bottom' }}
                                />
                            </th>
                            <th style={{ width: 140, padding: 12 }}>
                                <Link
                                    underline="none"
                                    component="button"
                                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                    fontWeight="lg"
                                    endDecorator={<ArrowDownRegular />}
                                    sx={{
                                        '& svg': {
                                            transition: '0.2s',
                                            transform: order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                        },
                                        color: 'hsl(244, 100%, 50%)',
                                    }}
                                >
                                    Work
                                </Link>
                            </th>
                            <th style={{ width: 120, padding: 12 }}>Applied Date</th>
                            <th style={{ width: 120, padding: 12 }}>Status</th>
                            <th style={{ width: 120, padding: 12 }}>Due Date</th>
                            <th style={{ width: 200, padding: 12 }}> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stableSort(proposalList, getComparator(order, 'id')).map((proposal) => (
                            <tr key={proposal.jobObj.id}>
                                <td style={{ textAlign: 'center' }}>
                                    <Checkbox
                                        checked={selected.includes(proposal.jobObj.id)}
                                        color={selected.includes(proposal.jobObj.id) ? 'primary' : undefined}
                                        onChange={(event) => {
                                            setSelected((ids) =>
                                                event.target.checked
                                                    ? ids.concat(proposal.jobObj.id)
                                                    : ids.filter((itemId) => itemId !== proposal.jobObj.id),
                                            )
                                        }}
                                        slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                                        sx={{ verticalAlign: 'text-bottom' }}
                                    />
                                </td>
                                <td>
                                    <Typography fontWeight="md">{proposal.jobObj.title}</Typography>
                                </td>
                                <td>
                                    {proposal.createdAt ? format(new Date(proposal.createdAt), 'PP') : 'Aug 26, 2023'}
                                </td>
                                <td>
                                    <Chip
                                        variant="soft"
                                        size="sm"
                                        startDecorator={
                                            {
                                                Success: <CheckmarkRegular />,
                                                Pending: <ArrowStepBackRegular />,
                                            }[proposal?.jobObj?.status !== 0 ? 'Success' : 'Pending']
                                        }
                                        color={
                                            {
                                                Success: 'success',
                                                Pending: 'neutral',
                                            }[proposal?.jobObj?.status !== 0 ? 'Success' : 'Pending']
                                        }
                                        sx={{ fontSize: '1.2rem' }}
                                    >
                                        {[proposal?.jobObj?.status !== 0 ? 'Success' : 'Pending']}
                                    </Chip>
                                </td>
                                <td>
                                    {proposal.jobObj?.deadline ? format(new Date(proposal.jobObj?.deadline), 'PP') : ''}
                                </td>
                                <td>
                                    {proposal?.jobObj?.status !== 0 && (
                                        <LinkRoute
                                            to={config.routes.workDetailFreelancerSide}
                                            state={{ work: proposal?.jobObj }}
                                        >
                                            <Link
                                                fontWeight="lg"
                                                component="button"
                                                color="neutral"
                                                sx={{ ml: 2 }}
                                                startDecorator={<EyeRegular />}
                                            >
                                                View
                                            </Link>
                                        </LinkRoute>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Sheet>
            <Box className="Pagination-mobile" sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                <IconButton aria-label="previous page" variant="outlined" color="neutral" size="sm">
                    <i data-feather="arrow-left" />
                </IconButton>
                <Typography level="body2" mx="auto">
                    Page 1 of 10
                </Typography>
                <IconButton aria-label="next page" variant="outlined" color="neutral" size="sm">
                    <i data-feather="arrow-right" />
                </IconButton>
            </Box>
            <Box
                className="Pagination-laptopUp"
                sx={{
                    pt: 4,
                    gap: 1,
                    display: {
                        xs: 'none',
                        md: 'flex',
                    },
                }}
            >
                <Button size="md" variant="plain" color="neutral" startDecorator={<ArrowLeftRegular />}>
                    Previous
                </Button>

                <Box sx={{ flex: 1 }} />
                {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
                    <IconButton key={page} size="sm" variant={Number(page) ? 'outlined' : 'plain'} color="neutral">
                        {page}
                    </IconButton>
                ))}
                <Box sx={{ flex: 1 }} />

                <Button size="md" variant="plain" color="neutral" endDecorator={<ArrowRightRegular />}>
                    Next
                </Button>
            </Box>
        </Fragment>
    )
}

export default ProposalsTable
