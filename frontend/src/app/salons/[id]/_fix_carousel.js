const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'MobileSalonProfile.tsx');
let content = fs.readFileSync(file, 'utf8');

// The broken pattern: Carousel + dots as two siblings inside ternary ()
// Find and replace the entire ternary true-branch
const oldPattern = /(\{allImages\.length > 0 \? \()[\s\S]*?(\) : \([\s\r\n]+<div className=\{styles\.noImage\}>)/;

const newBranch = `{allImages.length > 0 ? (
                        <>
                            <Carousel
                                setApi={setApi}
                                opts={{
                                    align: 'start',
                                    loop: true,
                                }}
                                orientation="horizontal"
                                style={{ width: '100%', height: '100%' }}
                            >
                                <CarouselContent style={{ marginLeft: 0, height: '320px' }}>
                                    {allImages.map((img, idx) => (
                                        <CarouselItem
                                            key={idx}
                                            style={{
                                                paddingLeft: 0,
                                                minWidth: '100%',
                                                height: '320px',
                                                position: 'relative'
                                            }}
                                            onClick={() => onOpenLightbox(allImages, idx)}
                                        >
                                            <div style={{ position: 'relative', width: '100%', height: '320px' }}>
                                                <OptimizedImage
                                                    src={transformCloudinary(img, { width: 800, quality: 'auto', format: 'auto', crop: 'fill' })}
                                                    alt={\`\${salon.name} photo \${idx + 1}\`}
                                                    fill
                                                    sizes="100vw"
                                                    priority={idx === 0}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>

                            {/* Dot indicators - outside Carousel to avoid Embla overflow clipping */}
                            {count > 1 && (
                                <div className={styles.carouselDots}>
                                    {Array.from({ length: Math.min(count, 8) }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={\`\${styles.carouselDot} \${idx + 1 === current ? styles.carouselDotActive : ''}\`}
                                            onClick={() => api?.scrollTo(idx)}
                                            aria-label={\`Go to image \${idx + 1}\`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.noImage}>`;

content = content.replace(oldPattern, newBranch);

fs.writeFileSync(file, content, 'utf8');
console.log('Done. Check MobileSalonProfile.tsx');
