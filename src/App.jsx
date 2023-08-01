import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import { Alchemy, Network } from "alchemy-sdk"
import { useState, useEffect } from "react"
import { ethers, providers } from "ethers"

function App() {
  const [userAddress, setUserAddress] = useState("")
  const [results, setResults] = useState([])
  const [hasQueried, setHasQueried] = useState(false)
  const [tokenDataObjects, setTokenDataObjects] = useState([])
  const [account, setAccount] = useState("")
  const [ensName, setEnsName] = useState("")

  const provider = new ethers.providers.JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/917wXcDegaRi4LnmRlDaiNWQQlVIslPd",
  )

  const handleInputChange = (e) => {
    setEnsName(e.target.value)
  }

  const handleSearch = async () => {
    try {
      const ensAddress = await provider.resolveName(ensName)
      console.log("ENS Address:", ensAddress)
    } catch (error) {
      console.log("Error resolving ENS name:", error)
    }
  }

  const connectHandler = async () => {
    try {
      const addresses = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const address = ethers.utils.getAddress(addresses[0])
      setAccount(address)
      setUserAddress(address)
    } catch (error) {
      console.log("Error connecting wallet:", error)
    }
  }

  useEffect(() => {
    if (userAddress) {
      console.log("User is connected! Address:", userAddress)
      getNFTsForOwner()
    } else {
      console.log("No address to fetch")
    }
  }, [account])

  async function getNFTsForOwner() {
    try {
      const config = {
        apiKey: "zqnjSXHHjA5JJ6sbz6x_1-8PgbAwFEon",
        network: Network.ETH_MAINNET,
      }

      setHasQueried(false)

      const alchemy = new Alchemy(config)
      const data = await alchemy.nft.getNftsForOwner(userAddress)
      setResults(data)

      const tokenDataPromises = []

      for (let i = 0; i < data.ownedNfts.length; i++) {
        const tokenData = await alchemy.nft.getNftMetadata(
          data.ownedNfts[i].contract.address,
          data.ownedNfts[i].tokenId,
        )
        tokenDataPromises.push(tokenData)
      }

      setTokenDataObjects(await Promise.all(tokenDataPromises))
      setHasQueried(true)
    } catch (error) {
      console.log("Error getting NFTs:", error)
    }
  }
  return (
    <Box w="100vw">
      <>
        {account ? (
          <Center>
            <Flex
              alignItems={"center"}
              justifyContent="center"
              flexDirection={"column"}
            >
              <Button fontSize={20} mt={36} bgColor="orange">
                Wallet Connected
              </Button>
            </Flex>
          </Center>
        ) : (
          <Center>
            <Flex
              alignItems={"center"}
              justifyContent="center"
              flexDirection={"column"}
            >
              <Button
                fontSize={20}
                onClick={connectHandler}
                mt={36}
                bgColor="#65db7f"
              >
                Connect Wallet
              </Button>
            </Flex>
          </Center>
        )}
      </>
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            Plug in an address and this website will return all of its NFTs!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={22}>Enter your ENS name</Heading>
        <Input
          type="text"
          value={ensName}
          onChange={handleInputChange}
          color="black"
          w="400px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button
          fontSize={20}
          onClick={handleSearch}
          mt={36}
          bgColor="rgb(186, 104, 186)"
        >
          Search ENS Name
        </Button>
        <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />

        <Button
          fontSize={20}
          onClick={getNFTsForOwner}
          mt={36}
          bgColor="rgb(38, 177, 177)"
        >
          Fetch NFTs
        </Button>

        <Heading my={36}>Here are your NFTs:</Heading>
        {hasQueried ? (
          <SimpleGrid
            w={"90vw"}
            columns={4}
            spacing={24}
            overflow="auto"
            h="400px"
          >
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={e.id}
                  padding={4}
                >
                  <Box>
                    <b>Name:</b>{" "}
                    {tokenDataObjects[i].title?.length === 0
                      ? "No Name"
                      : tokenDataObjects[i].title}
                  </Box>
                  <Image
                    src={
                      tokenDataObjects[i]?.rawMetadata?.image ??
                      "https://via.placeholder.com/200"
                    }
                    alt={"Image"}
                  />
                </Flex>
              )
            })}
          </SimpleGrid>
        ) : results.length !== 0 && !hasQueried ? (
          "Loading NFTs..."
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  )
}

export default App