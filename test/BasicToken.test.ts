import { ethers } from 'hardhat'
import { expect } from './shared/expect'
import { MockProvider } from 'ethereum-waffle'
import { BasicToken } from '../typechain'

describe('BasicToken', () => {
  let token: BasicToken
  let wallet, walletTo

  beforeEach(async () => {
    ;[wallet, walletTo] = await ethers.getSigners()
    const tokenFactory = await ethers.getContractFactory('BasicToken')
    token = (await tokenFactory.connect(wallet).deploy(1000)) as BasicToken
  })

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(1000)
  })

  it('Transfer adds amount to destination account', async () => {
    await token.connect(wallet).transfer(walletTo.address, 7)
    expect(await token.balanceOf(walletTo.address)).to.equal(7)
  })

  it('Transfer emits event', async () => {
    await expect(token.connect(wallet).transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7)
  })

  it('Can not transfer above the amount', async () => {
    await expect(token.connect(wallet).transfer(walletTo.address, 1007)).to.be.reverted
  })

  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo)
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1)).to.be.reverted
  })
})
