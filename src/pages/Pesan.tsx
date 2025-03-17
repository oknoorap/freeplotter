import cx from "clsx";
import { Key } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { BCAIcon } from "../components/BCAIcon";
import { HeaderTitle } from "../components/HeaderTitle";
import { RangeSlider } from "../components/RangeSlider";
import { NewOrderMutation, useNewOrder } from "../hooks/useAPI";
import { Container } from "../layouts/container";
import { DefaultLayout } from "../layouts/default";

const licenseTypes: Array<{
  licenseType: number;
  maxStory: number;
  maxParagraph: number;
  maxOutlineGeneration: number;
  label: string;
  basePrice: number;
  discount: Record<number, number>;
}> = [
  {
    licenseType: 1,
    maxStory: 12,
    maxParagraph: 20,
    maxOutlineGeneration: 12,
    label: "Standard",
    basePrice: 35000,
    discount: {
      2: 100000,
      3: 195000,
      4: 395000,
      5: 490000,
      6: 585000,
      7: 790000,
    },
  },
  {
    licenseType: 2,
    maxStory: 35,
    maxParagraph: 25,
    maxOutlineGeneration: 30,
    label: "Premium",
    basePrice: 50000,
    discount: {
      2: 125000,
      3: 265000,
      4: 550000,
      5: 695000,
      6: 800000,
      7: 1000000,
    },
  },
];

const durationLookup: Record<number, number> = {
  1: 1,
  2: 3,
  3: 6,
  4: 12,
  5: 15,
  6: 18,
  7: 24,
};

const durationSuffixLookup: Record<number, string> = {
  1: "bulan",
  2: "bulan",
  3: "bulan",
  4: "tahun",
  5: "tahun 3 bulan",
  6: "tahun 6 bulan",
  7: "tahun",
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
});

const randomUniquePrice = () => Math.floor(Math.random() * (1000 - 50) + 50);

const getPriceAndDiscount = (licenseType: number, expDuration: number) => {
  const { basePrice, discount } =
    licenseTypes.find((item) => item.licenseType === licenseType) ??
    licenseTypes[0];
  const quantity = durationLookup[expDuration];
  const price = basePrice * quantity;
  const discountPriceLookup = discount?.[expDuration];
  const discountPrice = discountPriceLookup;
  const hasDiscount = !!discountPriceLookup;

  return {
    price,
    discountPrice,
    hasDiscount,
  };
};

function PesanPage() {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [expDuration, setExpDuration] = useState(1);
  const [activeLicenseType, setActiveLicenseType] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useLocalStorage<
    NewOrderMutation["Response"] | null
  >("lastOrder", null);
  const hasOrder = !!lastOrder;

  const expDurationInMonth = useMemo(() => {
    const durationMonth =
      expDuration >= 4
        ? Math.floor(durationLookup[expDuration] / 12)
        : durationLookup[expDuration];
    const durationSuffix = durationSuffixLookup[expDuration];
    return `${durationMonth} ${durationSuffix}`;
  }, [expDuration]);

  const totalTransfer = useMemo(() => {
    const { price, discountPrice, hasDiscount } = getPriceAndDiscount(
      activeLicenseType,
      expDuration,
    );
    const uniqueNumber = randomUniquePrice();
    const calculatedPrice = hasDiscount ? discountPrice : price;
    const totalPrice = calculatedPrice + uniqueNumber;
    return totalPrice;
  }, [activeLicenseType, expDuration]);

  const handleChangeLicenseType = (licenseType: number) => () =>
    setActiveLicenseType(licenseType);

  const handleUpload = () => uploadRef?.current?.click();

  const handleViewUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const [file] = event.target.files;
    const blobUrl = URL.createObjectURL(file);
    setUploadedImage(blobUrl);
  };

  const handleRemoveUploadedImage = () => setUploadedImage(null);

  const newOrder = useNewOrder();
  const isSubmitting = newOrder.isLoading;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload = new FormData(
        event.currentTarget,
      ) as NewOrderMutation["Request"];
      payload.append("price", totalTransfer.toString());

      const startDate = new Date();
      const endDate = new Date(
        new Date(startDate).setMonth(
          startDate.getMonth() + durationLookup[expDuration],
        ),
      );
      payload.append("start_date", startDate.toISOString());
      payload.append("end_date", endDate.toISOString());

      const lastOrder = await newOrder.mutateAsync(payload);
      setLastOrder(lastOrder);
    } catch (error) {
      alert(
        `An error occurred, contact support with this message: \`${
          (error as Error).message
        }\``,
      );
    }
  };

  const isInputDisabled = isSubmitting || hasOrder;
  const handleResetOrder = () => {
    setName("");
    setEmail("");
    setPhone("");
    setUploadedImage("");
    setActiveLicenseType(1);
    setLastOrder(null);
    setExpDuration(1);
  };

  return (
    <DefaultLayout>
      <Container>
        <HeaderTitle
          title="Beli License Key"
          description="Dapatkan akses penuh aplikasi Freeplotter dengan membeli License Key resmi. Konfirmasi pembayaran setelah transfer, dan License Key akan langsung aktif serta dikirim ke email Anda."
          icon={Key}
        />

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <fieldset
            className={cx(
              "flex flex-col gap-2",
              isInputDisabled && "opacity-35 cursor-default",
            )}
          >
            <label className="block text-lg font-semibold" htmlFor="name">
              Nama
            </label>
            <input
              value={name}
              required
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
              disabled={isInputDisabled}
              type="text"
              id="name"
              name="name"
              placeholder="contoh: Sugih Arta"
              className="text-lg w-full p-4 bg-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-transparent border border-gray-700 ring-2 focus:ring-blue-500 focus:invalid:ring-red-500 "
            />
          </fieldset>

          <fieldset
            className={cx(
              "flex flex-col gap-2",
              isInputDisabled && "opacity-35 cursor-default",
            )}
          >
            <label className="block text-lg font-semibold" htmlFor="email">
              Email
            </label>
            <input
              value={email}
              required
              maxLength={200}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isInputDisabled}
              type="email"
              pattern="^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
              id="email"
              name="email"
              placeholder="contoh: email@gmail.com"
              className="text-lg w-full p-4 bg-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-transparent border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:invalid:ring-red-500"
            />
          </fieldset>

          <fieldset
            className={cx(
              "flex flex-col gap-2",
              isInputDisabled && "opacity-35 cursor-default",
            )}
          >
            <label className="block text-lg font-semibold" htmlFor="phone">
              Nomor Telpon / WhatsApp (Aktif)
            </label>
            <input
              value={phone}
              maxLength={200}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isInputDisabled}
              type="tel"
              id="phone"
              name="phone"
              placeholder="contoh:+6281234567890"
              className="text-lg w-full p-4 bg-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-transparent border border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </fieldset>

          <fieldset
            className={cx(
              "flex flex-col gap-2 mb-2",
              isInputDisabled && "opacity-35 cursor-default",
            )}
          >
            <label className="block text-lg font-semibold" htmlFor="phone">
              Masa Lisensi (Geser)
            </label>

            <span className="text-gray-400 inline-flex text-lg w-auto mb-4">
              License Key akan kadaluarsa dalam&nbsp;{" "}
              <strong>{expDurationInMonth}</strong>.
            </span>
            <RangeSlider
              id="exp-duration"
              step={1}
              min={1}
              max={7}
              value={expDuration}
              onChange={(e) => setExpDuration(e)}
            />
          </fieldset>

          <fieldset
            className={cx(
              "flex flex-col gap-2",
              isInputDisabled && "opacity-35 cursor-default",
            )}
          >
            <label htmlFor="" className="block text-lg font-semibold">
              Tipe Lisensi
            </label>
            <div className="flex gap-4">
              {licenseTypes.map(
                ({
                  label,
                  licenseType,
                  maxOutlineGeneration,
                  maxParagraph,
                  maxStory,
                }) => {
                  const { price, discountPrice, hasDiscount } =
                    getPriceAndDiscount(licenseType, expDuration);

                  const formattedPrice = priceFormatter.format(price);
                  const formattedDiscountPrice =
                    priceFormatter.format(discountPrice);

                  return (
                    <button
                      key={licenseType}
                      type="button"
                      className={cx(
                        "flex flex-col gap-1 flex-1 border border-gray-700 p-4 rounded-md",
                        activeLicenseType === licenseType
                          ? "bg-blue-800 text-white ring-4 ring-offset ring-blue-500"
                          : "bg-gray-900 text-gray-500 hover:text-gray-400",
                      )}
                      onClick={handleChangeLicenseType(licenseType)}
                    >
                      <strong className="text-xl mb-4">{label}</strong>
                      <div className="flex flex-col gap-0 mb-4">
                        <strong
                          className={cx(
                            hasDiscount
                              ? "line-through text-xl text-red-500 opacity-80"
                              : "text-3xl",
                          )}
                        >
                          {formattedPrice}
                        </strong>

                        {hasDiscount && (
                          <strong className="text-3xl">
                            {formattedDiscountPrice}
                          </strong>
                        )}
                      </div>
                      <span>
                        <strong className="underline">{maxStory} cerita</strong>{" "}
                        per bulan.
                      </span>
                      <span>
                        Max{" "}
                        <strong className="underline">
                          {maxParagraph} paragraf
                        </strong>{" "}
                        per cerita.
                      </span>
                      <span>
                        <strong className="underline">
                          {maxOutlineGeneration} outline (PDF)
                        </strong>{" "}
                        per bulan.
                      </span>
                    </button>
                  );
                },
              )}
            </div>
            <input
              type="hidden"
              name="license_type"
              value={activeLicenseType}
            />
          </fieldset>

          <fieldset
            className={cx(
              "flex flex-col gap-3 mt-8",
              isInputDisabled && "opacity-35 cursor-default",
            )}
          >
            <label className="block text-2xl font-semibold" htmlFor="">
              Transfer &amp; Konfirmasi
            </label>
            <p className="text-lg">
              1. Silakan transfer sejumlah (disertai nominal unik):
            </p>
            <div className="text-2xl text-white">
              {priceFormatter.format(totalTransfer)}
            </div>
            <p className="text-lg">2. Ke rekening berikut:</p>
            <div className="text-gray-900 text-xl rounded-lg bg-gray-200 p-4 flex items-center gap-4">
              <BCAIcon width={100} height={35} />
              <div className="font-bold">
                <h3>1302141481</h3>
                <div>a.n Ribhararnus Pracutian</div>
              </div>
            </div>
            <p className="text-lg">3. Unggah Bukti Transfer:</p>
            <div className="flex flex-col">
              <div
                aria-hidden
                className={cx(
                  "relative flex items-center justify-center p-5 border border-gray-400 rounded-lg cursor-pointer text-center",
                  !uploadedImage
                    ? "border-dashed"
                    : "border-b-0 rounded-b-none",
                )}
                onClick={handleUpload}
              >
                <input
                  id="tximg"
                  name="tximg"
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  className={cx(
                    "pointer-events-none",
                    uploadedImage && "hidden",
                  )}
                  onChange={handleViewUpload}
                />
                {uploadedImage && (
                  <img
                    ref={imageRef}
                    src={uploadedImage}
                    alt="Bukti transfer"
                    className="w-[200px] h-auto"
                  />
                )}
              </div>
              {uploadedImage && (
                <button
                  type="button"
                  className="bg-red-700 hover:bg-red-600 active:bg-red-800 border border-red-700 py-2 font-bold text-md rounded-es-lg rounded-ee-lg"
                  onClick={handleRemoveUploadedImage}
                >
                  Hapus / Ganti Gambar
                </button>
              )}
            </div>
          </fieldset>

          <button
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 p-4 rounded-xl text-xl font-bold disabled:opacity-35 cursor:pointer"
            disabled={isInputDisabled}
          >
            Konfirmasi &amp; Aktivasi <sup>*</sup>
          </button>

          {hasOrder && (
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 p-4 rounded-xl text-xl font-bold cursor:pointer"
              onClick={handleResetOrder}
            >
              Beli Lagi
            </button>
          )}

          <p className="text-xl text-center text-gray-500">
            * Karena banyaknya pesanan yang masuk, License Key akan otomatis
            dikirimkan ke email Anda dan akan teraktivasi paling lambat 1 jam
            setelah Anda melakukan konfirmasi melalui halaman ini. Kami akan
            melakukan konfirmasi manual untuk menghindari <em>Fraud</em>.
          </p>
        </form>
      </Container>
    </DefaultLayout>
  );
}

export default PesanPage;
